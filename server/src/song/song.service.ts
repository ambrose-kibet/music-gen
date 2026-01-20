import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, not, or, and, inArray, ilike, SQL, sql } from 'drizzle-orm';
import * as schema from './schema';
import { DATABASE_CONNECTION } from '../db/db-connection';
import { CreateSongDto } from './Dtos/create-song.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { SONG_JOB, SONG_QUEUE, DISTRIBUTION_QUEUE } from './constants';
import { UserService } from '../auth/user.service';
import { desc } from 'drizzle-orm';
import { asc } from 'drizzle-orm';
import { count } from 'drizzle-orm';

@Injectable()
export class SongService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
    @InjectQueue(SONG_QUEUE) private readonly songQueue: Queue,
    @InjectQueue(DISTRIBUTION_QUEUE)
    private readonly distributionQueue: Queue,
    private readonly userService: UserService,
  ) {}
  async createSong({
    data,
    userId,
    botId,
  }: {
    data: CreateSongDto;
    userId: string;
    botId?: string;
  }) {
    const song = await this.db.transaction(async (tx) => {
      const inserted = await tx
      .insert(schema.song)
      .values({
        userId: userId,
        botId: botId,
        lyrics: data.lyrics,
        instrumental: data.instrumental,
        prompt: data.prompt,
        fullyDescribedSong: data.fullyDescribedSong,
        describedLyrics: data.describedLyrics,
        shareTo: data.shareTo,
        duration:
        data.durationInSeconds || 140 + Math.floor(Math.random() * 20),
      })
      .returning({ id: schema.song.id });

      // keep the credit deduction inside the same transaction scope
      await this.userService.deductUserCredits(userId, 3);

      return inserted;
    });
    return song[0];
  }

  async getSongsByUserId({
    userId,
    search,
    page = 1,
    limit = 10,
    orderBy,
    botId,
  }: {
    userId: string;
    page: number;
    search?: string;
    limit: number;
    orderBy?: 'date asc' | 'date desc' | 'title asc' | 'title desc';
    botId?: string;
  }) {
    let orderClause: SQL<unknown>;
    switch (orderBy) {
      case 'date asc':
        orderClause = asc(schema.song.createdAt);
        break;
      case 'date desc':
        orderClause = desc(schema.song.createdAt);
        break;
      case 'title asc':
        orderClause = asc(schema.song.title);
        break;
      case 'title desc':
        orderClause = desc(schema.song.title);
        break;
      default:
        orderClause = desc(schema.song.createdAt);
    }

    let skip = (page - 1) * limit;
    let whereClause: SQL<unknown> | undefined,
      botIdClause: SQL<unknown> | undefined,
      searchClause: SQL<unknown> | undefined;

    if (botId) botIdClause = eq(schema.song.botId, botId);
    if (search) {
      const searchPattern = `%${search}%`;
      searchClause = or(
        ilike(schema.song.title, searchPattern),
        ilike(schema.song.prompt, searchPattern),
      );
    }

    whereClause = and(
      botIdClause ? botIdClause : sql`1=1`,
      searchClause ? searchClause : sql`1=1`,
      eq(schema.song.userId, userId),
      not(eq(schema.song.status, 'failed')),
    );

    const totalUserSongs = await this.db
      .select({
        count: count(),
      })
      .from(schema.song)
      .where(whereClause);

    const songs = await this.db
      .select({
        id: schema.song.id,
        title: schema.song.title,
        status: schema.song.status,
        coverS3Key: schema.song.coverS3Key,
        createdAt: schema.song.createdAt,
      })
      .from(schema.song)
      .where(whereClause)
      .limit(limit)
      .offset(skip)
      .orderBy(orderClause);
    return { songs, total: totalUserSongs[0].count };
  }
  async getSongById(songId: string) {
    const song = await this.db
      .select()
      .from(schema.song)
      .where(eq(schema.song.id, songId))
      .limit(1);
    if (song.length === 0) {
      throw new NotFoundException(`Song with ID ${songId} not found`);
    }
    return song[0];
  }

  async updateSongStatus({
    songId,
    status,
  }: {
    songId: string;
    status: typeof schema.song.$inferSelect.status;
  }) {
    const song = await this.getSongById(songId);

    const result = await this.db
      .update(schema.song)
      .set({ status: status })
      .where(eq(schema.song.id, songId))
      .returning();
    return result[0];
  }

  async distributeSong({
    songId,
    shareTo,
  }: {
    songId: string;
    shareTo: string[];
  }) {
    try {
      const song = await this.db
        .update(schema.song)
        .set({ shareTo: shareTo, status: 'distributing' })
        .where(eq(schema.song.id, songId))
        .returning({
          id: schema.song.id,
          shareTo: schema.song.shareTo,
          status: schema.song.status,
        });
      await this.distributionQueue.add(DISTRIBUTION_QUEUE, { songId });
      return song[0];
    } catch (error) {
      throw new Error('Failed to distribute song');
    }
  }

  async queueSongsForProcessing(songIds: string[]) {
    const songs = await this.db
      .select()
      .from(schema.song)
      .where(inArray(schema.song.id, songIds));
    const formattedSongs = songs.map((song) =>
      this.formatSongForProcessing(song, 'song'),
    );
    await this.songQueue.add(SONG_JOB, { songs: formattedSongs });

    return { queuedSongIds: songIds };
  }
  async getSongWithVideo(songId: string): Promise<
    typeof schema.song.$inferSelect & {
      songVideos: (typeof schema.songVideo.$inferSelect)[];
      songCategories: (typeof schema.songCategories.$inferSelect & {
        category: typeof schema.categories.$inferSelect;
      })[];
    }
  > {
    const song = await this.db.query.song.findFirst({
      where: eq(schema.song.id, songId),
      columns: {
        id: true,
        userId: true,
        audioS3Key: true,
        coverS3Key: true,
        botId: true,
        lyrics: true,
        instrumental: true,
        prompt: true,
        title: true,
        shareTo: true,
      },
      with: {
        songVideos: true,
        user: {
          columns: {
            id: true,
            name: true,
          },
        },
        songCategories: {
          with: {
            category: { name: true },
          },
        },
      },
    });
    if (!song) {
      throw new NotFoundException(`Song with ID ${songId} not found`);
    }
    return song as typeof schema.song.$inferSelect & {
      songVideos: (typeof schema.songVideo.$inferSelect)[];
      songCategories: (typeof schema.songCategories.$inferSelect & {
        category: typeof schema.categories.$inferSelect;
      })[];
    };
  }

  async updateSongVideo(
    data: Partial<typeof schema.songVideo.$inferInsert> & { id: string },
  ) {
    await this.db
      .update(schema.songVideo)
      .set(data)
      .where(eq(schema.songVideo.id, data.id));
  }

  private formatSongForProcessing(
    song: typeof schema.song.$inferSelect,
    requestType: 'short' | 'song',
  ) {
    return {
      request_type: requestType,
      id: song.id,
      user_id: song.userId,
      bot_id: song.botId,
      lyrics: song.lyrics,
      instrumental: song.instrumental,
      prompt: song.prompt,
      fully_described_song: song.fullyDescribedSong,
      described_lyrics: song.describedLyrics,
      audio_s3_key: song.audioS3Key,
      cover_s3_key: song.coverS3Key,
      videos: [],
      song_categories: [],
      status: song.status,
      duration: song?.duration || 140 + Math.floor(Math.random() * 20),
    };
  }
}
