import os
import uuid
import ffmpeg
from pydub import AudioSegment
import boto3


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


def upload_to_s3(file_path: str, object_key: str) -> str | None:
    """
    Upload a file to an S3 bucket with optional privacy settings.
    Args:
        file_path (str): The local file path to upload.
        object_key (str): The S3 object key (file name in the bucket).
    Returns:
        str: The S3 file id of the uploaded file.
    """
    s3_client = boto3.client("s3")
    bucket_name = os.environ.get("AWS_BUCKET_NAME")
    if not bucket_name:
        print("AWS_BUCKET_NAME is not set; cannot upload to S3")
        return None

    extra_args = {}

    # if image file, set to public-read
    if object_key.lower().endswith((".png", ".jpg", ".jpeg", ".gif")):
        extra_args["ACL"] = "public-read"

    try:
        s3_client.upload_file(file_path, bucket_name, object_key, ExtraArgs=extra_args)
        os.remove(file_path)  # Clean up local file after upload
        return object_key
    except Exception as e:
        print(f"Error uploading file to S3: {e}")
        return None
