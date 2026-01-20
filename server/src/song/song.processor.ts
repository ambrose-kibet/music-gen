import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as schema from './schema';
import { DATABASE_CONNECTION } from '../db/db-connection';
import { SONG_QUEUE } from './constants';
import { ProcessSongInterface } from '../utils/types';
import { Inject, Logger } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { ConfigService } from '@nestjs/config';
import { eq, inArray } from 'drizzle-orm';
import { GenerateSongResponse } from '../utils/types';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DISTRIBUTION_QUEUE, DISTRIBUTION_JOB } from './constants';
import axios from 'axios';
import { UserService } from '../auth/user.service';

@Processor(SONG_QUEUE, { concurrency: 1 })
export class SongProcessor extends WorkerHost {
  private readonly logger = new Logger(SongProcessor.name);
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    @InjectQueue(DISTRIBUTION_QUEUE)
    private readonly distributionQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<{ songs: ProcessSongInterface[] }>): Promise<void> {
    const { songs: data } = job.data;
    // Placeholder for song processing logic
    console.log(
      `Processing songs with IDs: ${data.map((song) => song.id).join(', ')}`,
    );
    try {
      const res = await axios.post<GenerateSongResponse[]>(
        this.configService.get<string>('GENERATE_SONG_URL')!,
        data,
        {
          headers: {
            'Modal-key': this.configService.get<string>('MODAL_PROXY_KEY')!,
            'Modal-secret':
              this.configService.get<string>('MODAL_PROXY_SECRET')!,
          },
        },
      );
      res.data.forEach(async (generatedSong) => {
        await this.db
          .update(schema.song)
          .set({
            status: 'distributing',
            audioS3Key: generatedSong.audio_s3_key,
            coverS3Key: generatedSong.cover_s3_key,
            lyrics: generatedSong.lyrics || null,
            prompt: generatedSong.prompt,
            title: generatedSong.title.replace(/[^a-zA-Z0-9 :\-']/g, ''), // Sanitize title removing special characters
          })
          .where(eq(schema.song.id, generatedSong.id));

        //categories
        await this.db.transaction(async (tx) => {
          await tx
            .insert(schema.categories)
            .values(
              generatedSong.song_categories.map((category) => ({
                name: category,
              })),
            )
            .onConflictDoNothing({ target: schema.categories.name });

          const existingCategories = await tx
            .select({
              id: schema.categories.id,
            })
            .from(schema.categories)
            .where(
              inArray(schema.categories.name, generatedSong.song_categories),
            );
          const categoryIds = [...existingCategories.map((c) => c.id)];
          await tx.insert(schema.songCategories).values(
            categoryIds.map((categoryId) => ({
              songId: generatedSong.id,
              categoryId,
            })),
          );
        });
        // videos
        await this.db.insert(schema.songVideo).values(
          generatedSong.videos.map((video) => ({
            songId: generatedSong.id,
            videoS3Key: video.video_s3_key,
            videoType: video.video_type,
            thumbnail_prompt: video.thumbnail_prompt,
            youtube_description: video.youtube_description,
            thumbnailS3Key: video.thumbnail_s3_key,
          })),
        );

        const res = await this.distributionQueue.add(DISTRIBUTION_JOB, {
          songId: generatedSong.id,
        });

        this.logger.log(
          `Added distribution job for song ID: ${generatedSong.id} with job ID: ${res.id}`,
        );
      });
      this.logger.log(
        `✅ Finished processing songs with IDs: ${data.map((song) => song.id).join(', ')}`,
      );
    } catch (error) {
      const songs = await this.db
        .select({
          id: schema.song.id,
          userId: schema.song.userId,
          audioS3Key: schema.song.audioS3Key,
        })
        .from(schema.song)
        .where(
          inArray(
            schema.song.id,
            data.map((song) => song.id),
          ),
        );

      songs.forEach(async (song) => {
        if (!song.audioS3Key) {
          //fail and refund credits
          console.log(
            `❌ Failing song with ID: ${song.id} and refunding credits`,
          );
          await this.db
            .update(schema.song)
            .set({
              status: 'failed',
            })
            .where(eq(schema.song.id, song.id));

          await this.userService.addUserCredits(song.userId, 3);
        }
      });
      console.error('Error processing songs:', error);
    }
  }
}
