import os
from typing import List
import modal
import requests
from app_instance import app
from ai_service import AIService, image
from ace_step_service import AceStepAIService
from schemas import GenerateSongRequest
from video_ai_service import VideoAIService


@app.function(image=image, timeout=1800)
@modal.fastapi_endpoint(method="POST", requires_proxy_auth=True)
def generate_endpoint(data: List[GenerateSongRequest]):
    music_gen_ai_service = AceStepAIService()
    ai_service = AIService()
    video_ai_service = VideoAIService()

    stateList = []
    for request in data:
        state = {
            "song_request": GenerateSongRequest.model_validate(request).model_dump()
        }
        stateList.append(state)

    updated_list = ai_service.process_song_requests.remote(stateList)

    updated_list = ai_service.add_cover_art_and_thumbnails_to_requests.remote(
        updated_list
    )
    updated_list = music_gen_ai_service.generate_music_batch.remote(updated_list)
    updated_list = video_ai_service.process_song_requests.remote(updated_list)

    return updated_list


@app.local_entrypoint()
def main():
    data = [
        {
            "request_type": "song",
            "id": "song123",
            "user_id": "user456",
            "bot_id": None,
            "lyrics": None,
            "instrumental": True,
            "prompt": "jazz, saxophone, jazz, saxophone, jazz",
            "fully_described_song": None,
            "described_lyrics": None,
            "audio_s3_key": None,
            "cover_s3_key": None,
            "videos": [],
            "status": "queued",
        }
    ]
    endpoint_url = generate_endpoint.get_web_url()
    response = requests.post(endpoint_url, json=data)
    response.raise_for_status()
    song_response = response.json()
    print(song_response)
