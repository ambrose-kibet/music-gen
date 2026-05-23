import modal
import os
import uuid
from app_instance import app
from utils import upload_to_cloudinary
from langgraph.graph import StateGraph, START, END
import json
import random
from schemas import AgentState, GenerateSongRequest
from datetime import datetime
from prompts import (
    CTA,
    DESCRIPTION_CTA,
    PROMPT_GENERATOR_PROMPT,
    PROMPT_GENERATOR_SYSTEM_PROMPT,
    LYRICS_GENERATOR_PROMPT,
    LYRICS_GENERATOR_SYSTEM_PROMPT,
    SONG_TITLE_GENERATOR_PROMPT,
    SONG_TITLE_GENERATOR_SYSTEM_PROMPT,
    SONG_CATEGORY_GENERATOR_PROMPT,
    SONG_CATEGORY_GENERATOR_SYSTEM_PROMPT,
    VIDEO_IDEAS_GENERATOR_PROMPT,
    VIDEO_IDEAS_GENERATOR_SYSTEM_PROMPT,
    VIDEO_PROMPT_FROM_IDEA_PROMPT,
    VIDEO_PROMPT_FROM_IDEA_SYSTEM_PROMPT,
    VIDEO_PROMPT_FROM_IDEA_CRITIQUE_PROMPT,
    VIDEO_PROMPT_FROM_IDEA_CRITIQUE_SYSTEM_PROMPT,
    VIDEO_SHORT_IDEAS_GENERATOR__PROMPT,
    YOUTUBE_DESCRIPTION_PROMPT,
    YOUTUBE_DESCRIPTION_SYSTEM_PROMPT,
    YOUTUBE_DESCRIPTION_CRITIQUE_PROMPT,
    YOUTUBE_DESCRIPTION_CRITIQUE_SYSTEM_PROMPT,
    HOROSCOPE_PREDICTOR_PROMPT,
    HOROSCOPE_PREDICTOR_SYSTEM_PROMPT,
    YOUTUBE_SHORTS_DESCRIPTION_CRITIQUE_PROMPT,
    YOUTUBE_SHORTS_DESCRIPTION_CRITIQUE_SYSTEM_PROMPT,
    YOUTUBE_SHORTS_DESCRIPTION_GENERATOR_PROMPT,
    YOUTUBE_SHORTS_DESCRIPTION_GENERATOR_SYSTEM_PROMPT,
    VIDEO_THUMBNAIL_GENERATOR_PROMPT,
    VIDEO_THUMBNAIL_GENERATOR_SYSTEM_PROMPT,
    VIDEO_THUMBNAIL_CONCEPTS,
    SONG_TITLE_UPDATER_PROMPT,
)


image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("git", "ffmpeg")
    .pip_install("transformers", "diffusers", "torch")
    .pip_install_from_requirements("requirements.txt")
    .env({"HF_HOME": "/.cache/huggingface"})
    .add_local_python_source("utils")
    .add_local_python_source("app_instance")
    .add_local_python_source("ai_service")
    .add_local_python_source("video_ai_service")
    .add_local_python_source("ace_step_service")
    .add_local_python_source("schemas")
    .add_local_python_source("prompts")
)

hf_volume = modal.Volume.from_name("qwen_hf_cache", create_if_missing=True)
music_gen_secrets = modal.Secret.from_name("music_gen_secrets")


@app.cls(
    image=image,
    gpu="L40S",
    volumes={"/.cache/huggingface": hf_volume},
    secrets=[music_gen_secrets],
    scaledown_window=15,
    max_containers=1,
    timeout=1800,
)
class AIService:
    @modal.enter()
    def load_model(self):
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
        from diffusers import AutoPipelineForText2Image

        model_id = "Qwen/Qwen2-7B-Instruct"
        self.tokenizer = AutoTokenizer.from_pretrained(model_id)
        self.llm = AutoModelForCausalLM.from_pretrained(
            model_id,
            torch_dtype="auto",
            device_map="auto",
            cache_dir="/.cache/huggingface",
        )
        self.image_model = AutoPipelineForText2Image.from_pretrained(
            "stabilityai/sdxl-turbo",
            torch_dtype=torch.float16,
            variant="fp16",
            cache_dir="/.cache/huggingface",
        ).to("cuda")

    def generate_image(self, prompt: str) -> str:
        """
        Generate an image using the provided image model and prompt.
        Args:
            image_model: The image generation model to use.
            prompt (str): The text prompt to guide the image generation.
        Returns:
            str: The file path to the generated image.
        """
        outdir = "/tmp/output"
        os.makedirs(outdir, exist_ok=True)
        image_id = str(uuid.uuid4())
        image_output_path = os.path.join(outdir, f"{image_id}.png")
        image = self.image_model(
            prompt=prompt, num_inference_steps=2, guidance_scale=0.0
        ).images[0]
        image.save(image_output_path)
        image_s3_id = upload_to_cloudinary(image_output_path, image_id, resource_type="image")
        return image_s3_id

    def prompt_llm(self, messages: list[dict]) -> str:
        """
        Invoke the LLM with the given prompt and return the AI's response message.
        Args:
            llm (HuggingFacePipeline): The language model to invoke.
            prompt (list[BaseMessage]): The list of messages forming the prompt.
        Returns:
            str: The AI's response message.

        """

        text = self.tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=True
        )
        model_inputs = self.tokenizer([text], return_tensors="pt").to(self.llm.device)

        generated_ids = self.llm.generate(model_inputs.input_ids, max_new_tokens=512)
        generated_ids = [
            output_ids[len(input_ids) :]
            for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
        ]

        response = self.tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[
            0
        ]
        return response

    def check_request_type(self, state: AgentState) -> str:
        """Determine the type of music generation request."""
        song_request = state["song_request"]
        if song_request["request_type"] == "short":
            return "generate_short"
        elif song_request["request_type"] == "song":
            return "generate_full_song"
        else:
            raise ValueError(f"Unknown request type: {song_request['request_type']}")

    def generate_short_ideas_node(self, state: AgentState) -> AgentState:
        """Generate short music video ideas based on the song request prompt."""
        song_prompt = state["song_request"]["prompt"]
        messages = [
            {"role": "system", "content": VIDEO_IDEAS_GENERATOR_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": VIDEO_SHORT_IDEAS_GENERATOR__PROMPT.format(
                    prompt=song_prompt
                ),
            },
        ]
        video_ideas_response = self.prompt_llm(messages=messages)
        video_ideas = json.loads(video_ideas_response)
        return {"ideas": video_ideas}

    def check_song_request_desc(self, state: AgentState) -> str:
        """Check if generate song request prompt is  provided or  we should fully infer it from descriptions."""
        has_description = state["song_request"]["fully_described_song"] is not None
        if has_description:
            return "generate_song_prompt"
        else:
            return "check_if_song_instrumental"

    def generate_song_prompt_node(self, state: AgentState) -> AgentState:
        """Generate a song prompt based on the fully described song."""
        descriptions = state["song_request"]["fully_described_song"]
        messages = [
            {"role": "system", "content": PROMPT_GENERATOR_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": PROMPT_GENERATOR_PROMPT.format(user_prompt=descriptions),
            },
        ]
        prompt_response = self.prompt_llm(messages=messages)
        prompt = prompt_response
        return {
            "song_request": {
                **state["song_request"],
                "prompt": prompt,
            }
        }

    def check_if_song_instrumental_node(self, state: AgentState) -> str:
        """Check if the song request is instrumental or has lyrics."""
        is_instrumental = state["song_request"]["instrumental"]
        if is_instrumental:
            return "generate_song_title"
        else:
            return "check_lyrics_type"

    def check_lyrics_type_node(self, state: AgentState) -> str:
        """Check if lyrics are provided or need to be generated."""
        if state["song_request"]["lyrics"]:
            return "generate_song_title"
        else:
            return "generate_song_lyrics"

    def generate_song_lyrics_node(self, state: AgentState) -> AgentState:
        """Generate song lyrics based on the described lyrics."""
        described_lyrics = (
            state["song_request"]["described_lyrics"]
            or state["song_request"]["fully_described_song"]
        )
        messages = [
            {"role": "system", "content": LYRICS_GENERATOR_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": LYRICS_GENERATOR_PROMPT.format(description=described_lyrics),
            },
        ]
        lyrics_response = self.prompt_llm(messages=messages)
        lyrics = lyrics_response

        return {
            "song_request": {
                **state["song_request"],
                "lyrics": lyrics,
            }
        }

    def generate_song_title_node(self, state: AgentState) -> AgentState:
        """Generate a song title based on the prompt."""
        song_description = ", ".join(state["song_request"]["song_categories"] or [])
        date = datetime.now().strftime("%A, %B %d, %Y")
        prompt = song_description + f", '{date}'"

        messages = [
            {
                "role": "system",
                "content": SONG_TITLE_GENERATOR_SYSTEM_PROMPT.format(date=date),
            },
            {
                "role": "user",
                "content": SONG_TITLE_GENERATOR_PROMPT.format(prompt=prompt),
            },
        ]
        title_response = self.prompt_llm(messages=messages)
        title = title_response

        return {
            "song_request": {
                **state["song_request"],
                "title": title,
            }
        }

    def generate_song_categories_node(self, state: AgentState) -> AgentState:
        """Generate song categories based on the prompt."""
        song_prompt = state["song_request"]["prompt"]
        song_description = state["song_request"]["fully_described_song"]
        prompt = (
            song_description + " " + song_prompt if song_description else song_prompt
        )
        messages = [
            {"role": "system", "content": SONG_CATEGORY_GENERATOR_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": SONG_CATEGORY_GENERATOR_PROMPT.format(prompt=prompt),
            },
        ]
        categories_response = self.prompt_llm(messages=messages)

        categories = json.loads(categories_response)
        return {
            "song_request": {
                **state["song_request"],
                "song_categories": categories,
            }
        }

    def generate_video_ideas_node(self, state: AgentState) -> AgentState:
        """Generate video ideas for the song based on the prompt and categories."""
        song_prompt = state["song_request"]["prompt"]
        song_categories = ", ".join(state["song_request"]["song_categories"] or [])
        video_ideas_prompt = f"{song_prompt} {song_categories}"
        messages = [
            {"role": "system", "content": VIDEO_IDEAS_GENERATOR_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": VIDEO_IDEAS_GENERATOR_PROMPT.format(
                    prompt=video_ideas_prompt
                ),
            },
        ]
        video_ideas_response = self.prompt_llm(messages=messages)
        video_ideas = json.loads(video_ideas_response)

        return {"ideas": video_ideas}

    def generate_video_prompt_node(self, state: AgentState) -> AgentState:
        """Generate a video prompt based on a selected video idea."""
        if len(state["messages"]) == 0:
            video_idea = state["ideas"][random.randint(0, len(state["ideas"]) - 1)]
            print(f"Selected video idea: {video_idea}")
            messages = [
                {"role": "system", "content": VIDEO_PROMPT_FROM_IDEA_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": VIDEO_PROMPT_FROM_IDEA_PROMPT.format(idea=video_idea),
                },
            ]
            video_prompt_response = self.prompt_llm(messages=messages)
            messages.append(
                {
                    "role": "assistant",
                    "content": video_prompt_response,
                }
            )

            return {"messages": messages}

        video_prompt_response = self.prompt_llm(messages=state["messages"])
        video_prompt = video_prompt_response

        return {
            "messages": [
                {
                    "role": "assistant",
                    "content": video_prompt,
                },
            ]
        }

    def critique_video_prompt_node(self, state: AgentState) -> AgentState:
        """Critique the generated video prompt and suggest improvements."""
        video_prompt = state["messages"][-1]["content"]
        messages = [
            {
                "role": "system",
                "content": VIDEO_PROMPT_FROM_IDEA_CRITIQUE_SYSTEM_PROMPT,
            },
            {
                "role": "user",
                "content": VIDEO_PROMPT_FROM_IDEA_CRITIQUE_PROMPT.format(
                    video_prompt=video_prompt
                ),
            },
        ]
        critique_response = self.prompt_llm(messages=messages)
        critique = critique_response + CTA

        return {
            "messages": [
                {
                    "role": "user",
                    "content": critique,
                },
            ],
        }

    def should_continue_video_to_prompt(self, state: AgentState) -> str:
        """Decide whether to continue refining the video prompt or finish."""
        if len(state["messages"]) >= 7:
            return "end"
        else:
            return "generate_video_prompt"

    def update_video_request_list_node(self, state: AgentState) -> AgentState:
        """Update the video request list in the song request."""
        video_prompt = (
            state["messages"][-1]["content"] if len(state["messages"]) > 0 else ""
        )
        video_request = {
            "id": uuid.uuid4().hex,
            "video_s3_key": None,
            "video_prompt": video_prompt,
            "youtube_url": None,
            "youtube_description": None,
            "video_type": state["song_request"]["request_type"],
        }

        updated_videos = state["song_request"]["videos"] or []
        updated_videos.append(video_request)

        return {
            "song_request": {
                **state["song_request"],
                "videos": updated_videos,
            }
        }

    def generate_youtube_description_node(self, state: AgentState) -> AgentState:
        """Generate a YouTube video description based on the video prompt and horoscope."""
        if len(state["description_messages"] or []) == 0:

            song_title = state["song_request"]["title"] or "Untitled"
            song_description = ", ".join(state["song_request"]["song_categories"]) or ""

            video_type = state["song_request"]["request_type"]
            if video_type == "short":
                system_prompt = YOUTUBE_SHORTS_DESCRIPTION_GENERATOR_SYSTEM_PROMPT
                user_prompt = YOUTUBE_SHORTS_DESCRIPTION_GENERATOR_PROMPT.format(
                    song_title=song_title,
                    song_description=song_description,
                )
            else:
                today_date = datetime.now().strftime("%A, %B %d, %Y")
                zodiac_signs = [
                    "Aries",
                    "Taurus",
                    "Gemini",
                    "Cancer",
                    "Leo",
                    "Virgo",
                    "Libra",
                    "Scorpio",
                    "Sagittarius",
                    "Capricorn",
                    "Aquarius",
                    "Pisces",
                ]
                zodiac_sign = zodiac_signs[random.randint(0, len(zodiac_signs) - 1)]
                horoscope_messages = [
                    {"role": "system", "content": HOROSCOPE_PREDICTOR_SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": HOROSCOPE_PREDICTOR_PROMPT.format(
                            date=today_date, sign=zodiac_sign
                        ),
                    },
                ]
                horoscope_response = self.prompt_llm(messages=horoscope_messages)
                horoscope = horoscope_response
                system_prompt = YOUTUBE_DESCRIPTION_SYSTEM_PROMPT
                user_prompt = YOUTUBE_DESCRIPTION_PROMPT.format(
                    song_title=song_title,
                    song_description=song_description,
                    horoscope=horoscope,
                )

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ]
            description_response = self.prompt_llm(messages=messages)
            description = description_response
            return {
                "description_messages": messages
                + [
                    {"role": "assistant", "content": description_response},
                ]
            }

        description_response = self.prompt_llm(messages=state["description_messages"])
        description = description_response
        return {
            "description_messages": [
                {
                    "role": "assistant",
                    "content": description,
                },
            ]
        }

    def critique_youtube_description_node(self, state: AgentState) -> AgentState:
        """Critique the generated YouTube video description and suggest improvements."""
        video_description = state["description_messages"][-1]["content"]
        video_type = state["song_request"]["request_type"]
        if video_type == "short":
            system_prompt = YOUTUBE_SHORTS_DESCRIPTION_CRITIQUE_SYSTEM_PROMPT
            user_prompt = YOUTUBE_SHORTS_DESCRIPTION_CRITIQUE_PROMPT.format(
                video_description=video_description
            )
        else:
            system_prompt = YOUTUBE_DESCRIPTION_CRITIQUE_SYSTEM_PROMPT
            user_prompt = YOUTUBE_DESCRIPTION_CRITIQUE_PROMPT.format(
                video_description=video_description
            )
        messages = [
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ]
        critique_response = self.prompt_llm(messages=messages)
        critique = critique_response + DESCRIPTION_CTA

        return {
            "description_messages": [
                {
                    "role": "user",
                    "content": critique,
                },
            ],
        }

    def should_continue_to_update_description_to_node(self, state: AgentState) -> str:
        """Decide whether to continue refining the YouTube description or finish."""
        if len(state["description_messages"]) >= 7:
            return "end"
        else:
            return "generate_youtube_description_node"

    def update_youtube_description_node(self, state: AgentState) -> AgentState:
        """Update the youtube description in the video request list in the song request."""
        video_description = state["description_messages"][-1]["content"]
        updated_videos = state["song_request"]["videos"] or []
        if len(updated_videos) == 0:
            return {}

        updated_videos[-1]["youtube_description"] = video_description

        return {
            "song_request": {
                **state["song_request"],
                "videos": updated_videos,
            }
        }

    def generate_video_thumbnail_prompt_node(self, state: AgentState) -> AgentState:
        """Generate a video thumbnail prompt based on the song title and description."""
        song_title = state["song_request"]["title"] or "Untitled"
        song_description = ", ".join(state["song_request"]["song_categories"]) or ""
        concept = random.choice(VIDEO_THUMBNAIL_CONCEPTS)
        messages = [
            {"role": "system", "content": VIDEO_THUMBNAIL_GENERATOR_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": VIDEO_THUMBNAIL_GENERATOR_PROMPT.format(
                    song_title=song_title,
                    song_description=song_description,
                    concept=concept,
                ),
            },
        ]
        thumbnail_prompt_response = self.prompt_llm(messages=messages)
        thumbnail_prompt = thumbnail_prompt_response
        updated_videos = state["song_request"]["videos"] or []
        updated_videos[-1]["thumbnail_prompt"] = thumbnail_prompt

        return {
            "song_request": {
                **state["song_request"],
                "videos": updated_videos,
            }
        }

    def update_song_title_node(self, state: AgentState) -> AgentState:
        """Update the song title based on the prompt."""
        tags = state["song_request"]["song_categories"]
        cover_art_description = (
            state["song_request"]["videos"][0]["thumbnail_prompt"]
            if state["song_request"]["videos"]
            else ""
        )
        messages = [
            {"role": "system", "content": SONG_TITLE_GENERATOR_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": SONG_TITLE_UPDATER_PROMPT.format(
                    cover_art_description=cover_art_description, tags=", ".join(tags)
                ),
            },
        ]
        title = state["song_request"]["title"]
        if state["song_request"]["request_type"] == "song":
            title_response = self.prompt_llm(messages=messages)
            title = title_response

        return {
            "song_request": {
                **state["song_request"],
                "title": title,
            }
        }

    def build_graph(self) -> StateGraph:
        graph = StateGraph(AgentState)
        graph.add_node("router", lambda state: state)
        graph.add_node("generate_short_ideas_node", self.generate_short_ideas_node)
        graph.add_node("generate_song_prompt_node", self.generate_song_prompt_node)

        graph.add_node("check_if_song_instrumental_router", lambda state: state)
        graph.add_node("check_lyrics_type_router", lambda state: state)
        graph.add_node("check_song_request_desc_router", lambda state: state)
        graph.add_node("generate_song_lyrics_node", self.generate_song_lyrics_node)
        graph.add_node("generate_song_title_node", self.generate_song_title_node)
        graph.add_node(
            "generate_song_categories_node", self.generate_song_categories_node
        )

        graph.add_node("generate_video_prompt_node", self.generate_video_prompt_node)
        graph.add_node("critique_video_prompt_node", self.critique_video_prompt_node)
        graph.add_node(
            "update_video_request_list_node", self.update_video_request_list_node
        )
        graph.add_node(
            "generate_youtube_description_node", self.generate_youtube_description_node
        )
        graph.add_node(
            "critique_youtube_description_node",
            self.critique_youtube_description_node,
        )

        graph.add_node(
            "update_youtube_description_node", self.update_youtube_description_node
        )
        graph.add_node(
            "generate_video_thumbnail_prompt_node",
            self.generate_video_thumbnail_prompt_node,
        )
        graph.add_node("update_song_title_node", self.update_song_title_node)

        graph.add_edge(START, "router")
        graph.add_conditional_edges(
            "router",
            self.check_request_type,
            {
                "generate_short": "generate_short_ideas_node",
                "generate_full_song": "check_song_request_desc_router",
            },
        )
        graph.add_edge("generate_short_ideas_node", "generate_video_prompt_node")
        graph.add_conditional_edges(
            "check_song_request_desc_router",
            self.check_song_request_desc,
            {
                "generate_song_prompt": "generate_song_prompt_node",
                "check_if_song_instrumental": "check_if_song_instrumental_router",
            },
        )
        graph.add_edge("generate_song_prompt_node", "check_if_song_instrumental_router")
        graph.add_conditional_edges(
            "check_if_song_instrumental_router",
            self.check_if_song_instrumental_node,
            {
                "generate_song_title": "generate_song_categories_node",
                "check_lyrics_type": "check_lyrics_type_router",
            },
        )
        graph.add_conditional_edges(
            "check_lyrics_type_router",
            self.check_lyrics_type_node,
            {
                "generate_song_title": "generate_song_categories_node",
                "generate_song_lyrics": "generate_song_lyrics_node",
            },
        )
        graph.add_edge("generate_song_lyrics_node", "generate_song_categories_node")
        graph.add_edge("generate_song_categories_node", "generate_song_title_node")
        graph.add_edge("generate_song_title_node", "update_video_request_list_node")
        graph.add_edge("critique_video_prompt_node", "generate_video_prompt_node")
        graph.add_conditional_edges(
            "generate_video_prompt_node",
            self.should_continue_video_to_prompt,
            {
                "generate_video_prompt": "critique_video_prompt_node",
                "end": "update_video_request_list_node",
            },
        )
        graph.add_edge(
            "update_video_request_list_node", "generate_video_thumbnail_prompt_node"
        )
        graph.add_edge("generate_video_thumbnail_prompt_node", "update_song_title_node")
        graph.add_edge("update_song_title_node", "generate_youtube_description_node")
        graph.add_edge(
            "critique_youtube_description_node", "generate_youtube_description_node"
        )
        graph.add_conditional_edges(
            "generate_youtube_description_node",
            self.should_continue_to_update_description_to_node,
            {
                "generate_youtube_description_node": "critique_youtube_description_node",
                "end": "update_youtube_description_node",
            },
        )
        graph.add_edge("update_youtube_description_node", END)

        app = graph.compile()

        return app

    def invoke_graph(self, request_state: AgentState) -> AgentState:
        graph = self.build_graph()
        state_output = graph.invoke(request_state)
        return state_output["song_request"]

    @modal.method()
    def process_song_requests(
        self, request_states: list[AgentState]
    ) -> list[GenerateSongRequest]:
        """Process the song requests through the state graph and return the updated song requests."""
        updated_list = []
        for state in request_states:
            state_output = self.invoke_graph(state)
            updated_list.append(state_output)
        return updated_list

    def generate_cover_art_and_thumbnail(
        self, request: GenerateSongRequest
    ) -> GenerateSongRequest:
        """Generate cover art for the song based on the prompt."""
        song_prompt = request["prompt"]
        song_title = request["title"]
        cover_art_prompt = f"{song_title}, {song_prompt} album cover art."
        image_s3_id = self.generate_image(prompt=cover_art_prompt)

        thumbnail_prompt = request["videos"][-1]["thumbnail_prompt"]
        thumbnail_s3_id = self.generate_image(prompt=thumbnail_prompt)

        video = request["videos"][-1]
        updated_videos = request["videos"][:-1] + [
            {**video, "thumbnail_s3_key": thumbnail_s3_id}
        ]

        return {
            **request,
            "cover_s3_key": image_s3_id,
            "videos": updated_videos,
        }

    @modal.method()
    def add_cover_art_and_thumbnails_to_requests(
        self, requests: list[GenerateSongRequest]
    ) -> list[GenerateSongRequest]:
        """Add cover art and thumbnails to each song request."""
        updated_requests = []
        for request in requests:
            updated_request = self.generate_cover_art_and_thumbnail(request)
            updated_requests.append(updated_request)
        return updated_requests
