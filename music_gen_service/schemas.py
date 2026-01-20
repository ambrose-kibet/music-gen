from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from typing_extensions import TypedDict, Literal
from typing_extensions import TypedDict, Annotated, Sequence
from langchain_core.messages import (
    BaseMessage,
)
from operator import add as add_messages


class VideoRequest(BaseModel):
    id: str
    video_s3_key: Optional[str] = None
    thumbnail_s3_key: Optional[str] = None
    thumbnail_prompt: Optional[str] = None
    video_prompt: Optional[str] = None
    youtube_url: Optional[str] = None
    youtube_description: Optional[str] = None
    video_type: Literal["short", "song"]


class GenerateSongRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    request_type: Literal["short", "song"]
    id: str
    user_id: str
    bot_id: Optional[str] = None
    title: Optional[str] = None
    lyrics: Optional[str] = None
    instrumental: bool = False
    prompt: Optional[str] = None
    fully_described_song: Optional[str] = None
    described_lyrics: Optional[str] = None
    audio_s3_key: Optional[str] = None
    cover_s3_key: Optional[str] = None
    videos: Optional[List[VideoRequest]] = None
    song_categories: Optional[List[str]] = None
    status: str
    guidance_scale: Optional[float] = 15.0
    duration: Optional[int] = 160
    infer_step: Optional[float] = 60
    seed: Optional[int] = -1


class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    description_messages: Annotated[Sequence[BaseMessage], add_messages]
    ideas: Annotated[List[str], add_messages]
    song_request: GenerateSongRequest
