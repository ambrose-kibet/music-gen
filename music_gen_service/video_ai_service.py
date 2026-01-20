import os
import uuid

from app_instance import app
from diffusers.utils import export_to_video, load_image

import modal

from schemas import GenerateSongRequest
from utils import upload_to_s3


image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("git", "ffmpeg")
    .pip_install(
        "transformers",
        "diffusers",
        "torch",
        "ftfy",
        "opencv-python",
    )
    .pip_install_from_requirements("requirements.txt")
    .env({"HF_HOME": "/.cache/huggingface"})
    .add_local_python_source("utils")
    .add_local_python_source("schemas")
    .add_local_python_source("app_instance")
    .add_local_python_source("video_ai_service")
)

hf_volume = modal.Volume.from_name("qwen_hf_cache", create_if_missing=True)
music_gen_secrets = modal.Secret.from_name("music_gen_secrets")


@app.cls(
    image=image,
    gpu="L40S",
    volumes={"/.cache/huggingface": hf_volume},
    secrets=[music_gen_secrets],
    scaledown_window=15,  # 60
    max_containers=1,
    timeout=1020,
)
class VideoAIService:
    @modal.enter()
    def load_model(self):
        import torch
        from diffusers import (
            AutoPipelineForText2Image,
            WanPipeline,
            AutoencoderKLWan,
            StableVideoDiffusionPipeline,
        )

        video_model_id = "Wan-AI/Wan2.1-T2V-1.3B-Diffusers"
        vae = AutoencoderKLWan.from_pretrained(
            video_model_id,
            subfolder="vae",
            torch_dtype=torch.float32,
        )
        video_model = WanPipeline.from_pretrained(
            video_model_id,
            vae=vae,
            torch_dtype=torch.bfloat16,
            cache_dir="/.cache/huggingface",
        ).to("cuda")
        self.video_model = video_model

        stability_model_id = "stabilityai/stable-video-diffusion-img2vid-xt"
        self.stability_video_model = StableVideoDiffusionPipeline.from_pretrained(
            stability_model_id, torch_dtype=torch.float16, variant="fp16"
        ).to("cuda")

    @modal.method()
    def generate_video(
        self, prompt: str, aspect_ratio: float = 16 / 9, fps: int = 16
    ) -> str:

        def round_to_16(x: int) -> int:
            return (x // 16) * 16

        outdir = "/tmp/output"
        os.makedirs(outdir, exist_ok=True)
        video_id = str(uuid.uuid4())

        negative_prompt = (
            "Bright tones, overexposed, static, blurred details, subtitles, style, works, "
            "paintings, images, static, overall gray, worst quality, low quality, JPEG "
            "compression residue, ugly, incomplete, extra fingers, poorly drawn hands, "
            "poorly drawn faces, deformed, disfigured, misshapen limbs, fused fingers, "
            "still picture, messy background, three legs, many people in the background, "
            "walking backwards"
        )

        base = 480

        if aspect_ratio >= 1:
            height = base
            width = int(base * aspect_ratio)
        else:
            width = base
            height = int(base / aspect_ratio)

        # MUST BE DIVISIBLE BY 16
        width = round_to_16(width)
        height = round_to_16(height)

        output = self.video_model(
            prompt=prompt,
            negative_prompt=negative_prompt,
            height=height,
            width=width,
            num_frames=161,
            guidance_scale=5.0,
        ).frames[0]

        export_to_video(output, f"{outdir}/{video_id}.mp4", fps=fps)

        video_s3_id = upload_to_s3(
            f"{outdir}/{video_id}.mp4", object_key=f"{video_id}.mp4"
        )

        return video_s3_id

    def generate_video_from_image(
        self,
        init_image_path: str,
        aspect_ratio: float = 16 / 9,
        fps: int = 6,
    ) -> str:
        import torch
        import ffmpeg

        outdir = "/tmp/output"
        os.makedirs(outdir, exist_ok=True)
        video_id = str(uuid.uuid4())

        base = 576

        init_image = load_image(init_image_path)
        init_image = (
            init_image.resize((base, int(base / aspect_ratio)))
            if aspect_ratio < 1
            else init_image.resize((int(base * aspect_ratio), base))
        )

        generator = torch.manual_seed(42)

        video_frames = self.stability_video_model(
            init_image,
            decode_chunk_size=8,
            generator=generator,
            num_frames=25,
        ).frames[0]

        export_to_video(video_frames, f"{outdir}/{video_id}.mp4", fps=fps)
        video_one_path = f"{outdir}/{video_id}.mp4"

        # convert to 30 fps (interpolated)
        video_one_path_30fps = f"{outdir}/{video_id}_30fps.mp4"

        (
            ffmpeg.input(video_one_path)
            .output(
                video_one_path_30fps,
                vf="minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir",
                an=None,
            )
            .run(overwrite_output=True)
        )

        video_s3_id = upload_to_s3(
            video_one_path_30fps, object_key=f"{video_id}_30fps.mp4"
        )

        # clean up temp files
        os.remove(video_one_path)

        return video_s3_id

    def generate_request_video(
        self, request: GenerateSongRequest
    ) -> GenerateSongRequest:
        """Generates a video for a single song request."""
        thumbnail_s3_key = request["videos"][-1]["thumbnail_s3_key"]
        url = f"https://{os.environ['AWS_BUCKET_NAME']}.s3.{os.environ['AWS_REGION']}.amazonaws.com/{thumbnail_s3_key}"
        aspect_ratio = 16 / 9
        fps = 6
        video_s3_key = self.generate_video_from_image(
            init_image_path=url,
            aspect_ratio=aspect_ratio,
            fps=fps,
        )
        video = request["videos"][-1]
        updated_videos = request["videos"][:-1] + [
            {**video, "video_s3_key": video_s3_key}
        ]
        return {**request, "videos": updated_videos}

    @modal.method()
    def process_song_requests(
        self, song_requests: list[GenerateSongRequest]
    ) -> list[GenerateSongRequest]:
        """Generates videos for a batch of song requests.

        Args:
            song_requests (list[GenerateSongRequest]): A list of song requests.
        Returns:
            list[GenerateSongRequest]: A list of updated song requests with video S3 keys.
        """
        updated_requests = []
        for song_request in song_requests:
            updated_request = self.generate_request_video(song_request)
            updated_requests.append(updated_request)
        return updated_requests
