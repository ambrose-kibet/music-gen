import { Injectable, Inject } from '@nestjs/common';
import path from 'path';
import { getPresignedUrl, downloadFileFromS3 } from '../utils/aws-helpers';
import { FILES_STORAGE_PATH } from './constants';
import { SongService } from './song.service';
import { IntegrationService } from '../integration/integration.service';
import { ConfigService } from '@nestjs/config';
import { promises as fsPromises } from 'fs';
import { cutVideo, mergeVideoToAudio } from '../utils/ffmpeg-helpers';

@Injectable()
export class DistributionService {
  constructor(
    private readonly songService: SongService,
    private readonly configService: ConfigService,
  ) {}

  async downloadSongFiles(songId: string) {
    const song = await this.songService.getSongWithVideo(songId);

    const audioPresignedUrl = await getPresignedUrl(song.audioS3Key!, 3600);
    const videoPresignedUrl = await getPresignedUrl(
      song.songVideos![0].videoS3Key!,
      3600,
    );

    const videoThumbnailUrl = await getPresignedUrl(
      song.songVideos![0].thumbnailS3Key!,
      3600,
    );

    // if file storage path does not exist, create it
    try {
      await fsPromises.access(FILES_STORAGE_PATH);
    } catch (err) {
      await fsPromises.mkdir(FILES_STORAGE_PATH, { recursive: true });
    }
    const audioDownloadPath = path.join(
      FILES_STORAGE_PATH,
      song.audioS3Key!.replace(/\//g, '_'),
    );
    const videoDownloadPath = path.join(
      FILES_STORAGE_PATH,
      song.songVideos![0].videoS3Key!.replace(/\//g, '_'),
    );

    const videoThumbnailDownloadPath = path.join(
      FILES_STORAGE_PATH,
      song.songVideos![0].thumbnailS3Key!.replace(/\//g, '_'),
    );

    // Download files

    await Promise.all([
      await downloadFileFromS3({
        signedUrl: audioPresignedUrl,
        downloadPath: audioDownloadPath,
      }),
      await downloadFileFromS3({
        signedUrl: videoPresignedUrl,
        downloadPath: videoDownloadPath,
      }),
      await downloadFileFromS3({
        signedUrl: videoThumbnailUrl,
        downloadPath: videoThumbnailDownloadPath,
      }),
    ]);

    return {
      audioDownloadPath,
      videoDownloadPath,
      videoThumbnailDownloadPath,
    };
  }
  async mergeVideoAndAudio(songId: string) {
    const { audioDownloadPath, videoDownloadPath, videoThumbnailDownloadPath } =
      await this.downloadSongFiles(songId);
    const outputPath = path.join(
      FILES_STORAGE_PATH,
      `final_output_${songId}.mp4`,
    );

    const shortVideoPath = path.join(
      FILES_STORAGE_PATH,
      `short_video_${songId}.mp4`,
    );

    await mergeVideoToAudio({
      videoPath: videoDownloadPath,
      audioPath: audioDownloadPath,
      outputPath,
    });

    // Create a short 20-second video for preview
    await cutVideo({
      videoPath: outputPath,
      startTime: '00:00:30',
      duration: '00:00:20',
      outputPath: shortVideoPath,
    });

    // Clean up downloaded files

    await fsPromises.unlink(videoDownloadPath);
    return {
      videoPath: outputPath,
      shortVideoPath,
      thumbnailPath: videoThumbnailDownloadPath,
      audioPath: audioDownloadPath,
    };
  }
  async cleanupResidualFilesFromPreviousAttempts() {
    const basePath = FILES_STORAGE_PATH;
    const files = await fsPromises.readdir(basePath);
    const now = Date.now();

    for (const file of files) {
      await fsPromises.unlink(path.join(basePath, file));
    }
  }
}
