import os
import modal
from schemas import GenerateSongRequest
from utils import apply_audio_filters, compress_audio, generate_song, upload_to_s3
from app_instance import app


ace_image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("git", "ffmpeg")
    .pip_install(
        "torch==2.8.0",
        "torchaudio==2.8.0",
        "transformers==4.35.2",
        "diffusers==0.24.0",
        "peft==0.17.0",
    )
    .pip_install_from_requirements("requirements.txt")
    .run_commands(
        [
            "git clone https://github.com/ace-step/ACE-Step.git /tmp/ACE-Step",
            "cd /tmp/ACE-Step && pip install -e .",
        ]
    )
    .env({"HF_HOME": "/.cache/huggingface"})
    .add_local_python_source("utils")
    .add_local_python_source("schemas")
    .add_local_python_source("app_instance")
    .add_local_python_source("ace_step_service")
)

model_volume = modal.Volume.from_name("ace_step_model", create_if_missing=True)
music_gen_secrets = modal.Secret.from_name("music_gen_secrets")


@app.cls(
    image=ace_image,
    gpu="L40S",
    volumes={"/model": model_volume},
    scaledown_window=15,  # 75
    secrets=[music_gen_secrets],
    max_containers=1,
)
class AceStepAIService:
    @modal.enter()
    def load_model(self):

        from acestep.pipeline_ace_step import ACEStepPipeline

        # Music Generation Model
        self.music_model = ACEStepPipeline(
            checkpoint_dir="/models",
            dtype="bfloat16",
            torch_compile=False,
            cpu_offload=False,
            overlapped_decode=False,
        )

    def generate_music(
        self, prompt: str, lyrics: str | None, duration: int | None = 160
    ) -> str:
        """_summary_
        - Generates a music track based on the provided prompt, lyrics, and duration.
        - Applies audio filters and compresses the generated track.
        - Uploads the final track to S3 and returns the S3 ID.
        Args:
            prompt (str): The textual description or theme for the music generation.
            lyrics (str | None): Optional lyrics to be incorporated into the music.
            duration (int): The desired length of the generated music track in seconds.

        Returns:
            str: The S3 ID of the uploaded music track.
        """
        verified_lyrics = lyrics if lyrics is not None else ""
        s3bucket = os.environ.get(
            "AWS_BUCKET_NAME",
        )
        print(f"Using S3 bucket: {s3bucket}")

        song_path = generate_song(
            self.music_model, prompt=prompt, lyrics=verified_lyrics, duration=duration
        )

        filtered_song_path = apply_audio_filters(song_path)
        compressed_song_path = compress_audio(filtered_song_path)
        s3_id = upload_to_s3(
            compressed_song_path, object_key=os.path.basename(compressed_song_path)
        )

        return s3_id

    def generate_music_for_song_request(
        self, song_request: GenerateSongRequest
    ) -> GenerateSongRequest:
        """Generates music for a given song request and updates the request with the audio S3 key.

        Args:
            song_request (GenerateSongRequest): The song request containing details for music generation.
        Returns:
            GenerateSongRequest: The updated song request with the audio S3 key.
        """
        prompt = song_request["prompt"]
        lyrics = (
            song_request["lyrics"]
            if not song_request["instrumental"] == True
            else "[instrumental]"
        )
        duration = song_request["duration"]
        audio_s3_key = self.generate_music(prompt, lyrics, duration)
        song_request["audio_s3_key"] = audio_s3_key
        return song_request

    @modal.method()
    def generate_music_batch(
        self, song_requests: list[GenerateSongRequest]
    ) -> list[GenerateSongRequest]:
        """Generates music for a batch of song requests.

        Args:
            song_requests (list[GenerateSongRequest]): A list of song requests.
        Returns:
            list[GenerateSongRequest]: A list of updated song requests with audio S3 keys.
        """
        updated_requests = []
        for song_request in song_requests:
            updated_request = self.generate_music_for_song_request(song_request)
            updated_requests.append(updated_request)
        return updated_requests
