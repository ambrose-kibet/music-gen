import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import ffprobePath from 'ffprobe-static';
import fs from 'fs';
import { promisify } from 'util';
ffmpeg.setFfmpegPath(ffmpegPath!);
ffmpeg.setFfprobePath(ffprobePath.path);

const probe = promisify(ffmpeg.ffprobe);

async function mergeVideoToAudio({
  videoPath,
  audioPath,
  outputPath,
}: {
  videoPath: string;
  audioPath: string;
  outputPath: string;
}) {
  const videoAbs = fs.realpathSync(videoPath);
  const audioAbs = fs.realpathSync(audioPath);

  // --- 1. get durations ---
  const videoInfo = (await probe(videoAbs)) as any;
  const audioInfo = (await probe(audioAbs)) as any;

  const videoDur = Number(videoInfo.format.duration);
  const audioDur = Number(audioInfo.format.duration);

  if (!videoDur || !audioDur) throw new Error('Invalid media duration');

  // --- 2. compute how many loops are needed ---
  const loops = Math.ceil(audioDur / videoDur);

  // --- 3. build concat list ---
  const concatFile = 'list.txt';
  let listContent = '';
  for (let i = 0; i < loops; i++) {
    listContent += `file '${videoAbs}'\n`;
  }
  fs.writeFileSync(concatFile, listContent);

  // --- 4. create long concatenated video ---
  const longVideo = 'looped_forward.mp4';

  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatFile)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c copy'])
      .save(longVideo)
      .on('end', resolve)
      .on('error', reject);
  });

  // --- 5. optional: add tiny fade at start/end for smooth loop ---
  const fadeDuration = 1; // seconds
  const seamlessVideo = 'seamless_forward.mp4';

  await new Promise((resolve, reject) => {
    ffmpeg(longVideo)
      .videoFilter([
        `fade=t=in:st=0:d=${fadeDuration}`, // fade in at start
        `fade=t=out:st=${audioDur - fadeDuration}:d=${fadeDuration}`, // fade out at end
      ])
      .save(seamlessVideo)
      .on('end', resolve)
      .on('error', reject);
  });

  // --- 6. merge with audio and trim to audio length ---
  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(seamlessVideo)
      .input(audioAbs)
      .outputOptions(['-c:v libx264', '-c:a aac', '-shortest'])
      .save(outputPath)
      .on('end', resolve)
      .on('error', reject);
  });

  // --- 7. cleanup ---
  fs.unlinkSync(concatFile);
  fs.unlinkSync(longVideo);
  fs.unlinkSync(seamlessVideo);
}

/**
 * @param startTime Start time in seconds (number) or time string.
 *                  Examples:
 *                  - 12
 *                  - 12.5
 *                  - "00:01:30"
 *                  - "00:01:30.250"
 *
 * @param duration  Duration in seconds (number) or time string.
 *                  Examples:
 *                  - 5
 *                  - 2.75
 *                  - "00:00:05"
 *                  - "00:00:02.750"
 */
const cutVideo = async ({
  videoPath,
  outputPath,
  startTime,
  duration,
}: {
  videoPath: string;
  outputPath: string;
  startTime: number | string;
  duration: number | string;
}) => {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .setStartTime(startTime)
      .setDuration(duration)
      .outputOptions([
        '-c:v libx264',
        '-pix_fmt yuv420p',
        '-profile:v high',
        '-level 4.0',
        '-c:a aac',
        '-movflags +faststart',
      ])
      .save(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  });
};

export { mergeVideoToAudio, cutVideo };
