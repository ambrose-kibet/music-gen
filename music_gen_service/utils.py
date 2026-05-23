import os
import uuid
import ffmpeg
from pydub import AudioSegment
import cloudinary
import cloudinary.uploader

CLOUDINARY_FOLDER = "music-gen"


def generate_song(music_model, prompt: str, lyrics: str, duration: int = 160) -> str:
    """
    Generate a song using the provided music model, prompt, lyrics, and duration.
    Args:
        music_model: The music generation model to use.
        prompt (str): The text prompt to guide the music generation.
        lyrics (str): The lyrics to include in the generated song.
        duration (int): The desired duration of the generated song in seconds. Default is 160 seconds.
    Returns:
        str: The file path to the generated song.
    """
    outdir = "/tmp/output"
    os.makedirs(outdir, exist_ok=True)
    song_id = str(uuid.uuid4())
    song_path = f"{outdir}/{song_id}.wav"

    music_model(
        prompt=prompt,
        lyrics=lyrics,
        audio_duration=duration,
        infer_step=60,
        guidance_scale=15,
        save_path=song_path,
    )
    return song_path


def apply_audio_filters(input_path: str) -> str:
    """
    Apply audio filters to the input audio file, equalizing and normalizing and remastering it.
    Args:
        input_path (str): The file path to the input audio file.
    Returns:
        str: The file path to the output audio file with applied filters.

    """
    audio = AudioSegment.from_file(input_path)
    output_path = input_path.replace(".wav", "_filtered.wav")

    audio.export(
        output_path,
        format="wav",
        parameters=[
            "-af",
            """
            highpass=f=25, 
            lowpass=f=18500, 
            equalizer=f=250:t=q:w=80:g=-2, 
            afftdn=nf=-20, 
            acompressor=threshold=-16dB:ratio=2.5:attack=15:release=200:makeup=2, 
            loudnorm=I=-14:TP=-1.5:LRA=7
            """,
        ],
    )
    # remove the unfiltered file
    os.remove(input_path)
    return output_path


def compress_audio(input_path: str) -> str:
    """
    Compress the audio file to reduce its size while maintaining quality.
    Args:
        input_path (str): The file path to the input audio file.
    Returns:
        str: The file path to the compressed audio file.
    """
    output_path = input_path.replace(".wav", "_compressed.mp3")

    (
        ffmpeg.input(input_path)
        .output(output_path, audio_bitrate="256k", format="mp3", acodec="libmp3lame")
        .run(overwrite_output=True)
    )
    return output_path


def upload_to_cloudinary(
    file_path: str,
    public_id: str,
    resource_type: str = "image",
    private: bool = False,
) -> str | None:
    """
    Upload a file to Cloudinary.
    Args:
        file_path (str): The local file path to upload.
        public_id (str): The Cloudinary public ID for the asset.
        resource_type (str): "image", "raw", or "video".
        private (bool): If True, upload as authenticated (access-controlled).
    Returns:
        str: The Cloudinary public_id of the uploaded file (includes folder prefix).
    """
    cloudinary.config(
        cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
        api_key=os.environ.get("CLOUDINARY_API_KEY"),
        api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
        secure=True,
    )
    params = {
        "public_id": public_id,
        "folder": CLOUDINARY_FOLDER,
        "resource_type": resource_type,
        "overwrite": True,
    }
    if private:
        params["type"] = "authenticated"

    try:
        result = cloudinary.uploader.upload(file_path, **params)
        if os.path.exists(file_path):
            os.remove(file_path)
        return result["public_id"]
    except Exception as e:
        print(f"Error uploading file to Cloudinary: {e}")
        return None
