import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, Logger } from '@nestjs/common';
import { DISTRIBUTION_JOB, DISTRIBUTION_QUEUE } from './constants';
import { FacebookService } from '../integration/facebook/facebook.service';
import { YoutubeService } from '../integration/youtube/youtube.service';
import { AudiusService } from '../integration/audius/audius.service';
import { IntegrationService } from '../integration/integration.service';
import { DistributionService } from './distribution.service';
import { SongService } from './song.service';
import { unlinkSync } from 'fs';

@Processor(DISTRIBUTION_QUEUE, { concurrency: 1 })
export class DistributionProcessor extends WorkerHost {
  private readonly logger = new Logger(DistributionProcessor.name);
  constructor(
    private readonly facebookService: FacebookService,
    private readonly youtubeService: YoutubeService,
    private readonly audiusService: AudiusService,
    private readonly integrationService: IntegrationService,
    private readonly distributionService: DistributionService,
    private readonly songService: SongService,
  ) {
    super();
  }

  async process(job: Job<{ songId: string }>): Promise<void> {
    const { songId } = job.data;
    const song = await this.songService.getSongWithVideo(songId);
    this.logger.log(`🚀 Starting distribution for song ID: ${songId}`);
    //clean up residual files from previous attempts
    await this.distributionService.cleanupResidualFilesFromPreviousAttempts();

    const userIntegrations = await this.integrationService.getUserIntegrations({
      userId: song.userId,
      integrations: song.shareTo as (
        | 'whatsapp'
        | 'audius'
        | 'youtube'
        | 'facebook'
      )[],
    });
    this.logger.log(
      `Found ${userIntegrations.length} integrations for user ID: ${song.userId}`,
    );
    if (userIntegrations.length === 0) {
      // No integrations to distribute to mark song as distributed
      await this.songService.updateSongStatus({
        songId,
        status: 'completed',
      });
      return;
    }

    const { audioPath, shortVideoPath, thumbnailPath, videoPath } =
      await this.distributionService.mergeVideoAndAudio(songId);

    let youtubeUrl: string | undefined = undefined;
    for (const integration of userIntegrations) {
      if (integration.type === 'youtube') {
        if (!song.songVideos?.[0]?.youtube_url) {
          youtubeUrl = await this.youtubeService.uploadVideo({
            userId: song.userId,
            videoPath,
            title: song.title || 'Untitled',
            description: song.songVideos?.[0]?.youtube_description || '',
            tags: song.songCategories?.map((cat) => cat.category.name) || [],
            thumbnailPath,
          });
        }
        if (youtubeUrl) {
          this.logger.log(`Uploaded to YouTube: ${youtubeUrl}`);
          await this.songService.updateSongVideo({
            id: song.songVideos?.[0]?.id!,
            youtube_url: youtubeUrl,
          });
        }
      }
      if (integration.type === 'facebook') {
        const facebookPostId =
          await this.facebookService.publishMediaToPageStory({
            userId: song.userId,
            caption:
              song.songVideos?.[0]?.youtube_description +
                (youtubeUrl
                  ? `\nGet the full track here: ${youtubeUrl}  \n Please do not forget like and subscribe!`
                  : '') || '',
            mediaPath: shortVideoPath,
          });
        if (facebookPostId) {
          this.logger.log(
            `Posted to Facebook: ${JSON.stringify(facebookPostId)}`,
          );
        }
      }
      if (integration.type === 'audius') {
        // const audiusTrackUrl = await this.audiusService.uploadToAudius({
        //   userId: song.userId,
        //   audioPath,
        //   title: song.title || 'Untitled',
        //   description: song.songVideos?.[0]?.youtube_description || '',
        //   thumbnailPath,
        //   tags: song.songCategories?.map((cat) => cat.category.name) || [],
        // });

        // if (audiusTrackUrl) {
        //   console.log(`Uploaded to Audius: ${audiusTrackUrl}`);
        // }
        console.log(`Audius integration is currently disabled.`);
      }
    }

    // Finally, mark song as completed
    await this.songService.updateSongStatus({
      songId,
      status: 'completed',
    });
    unlinkSync(audioPath);
    unlinkSync(shortVideoPath);
    unlinkSync(thumbnailPath);
    unlinkSync(videoPath);

    this.logger.log(`✅ Finished distributing song with ID: ${songId}`);
  }
}
