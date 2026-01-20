import {
  pgTable,
  serial,
  text,
  pgEnum,
  integer,
  uuid,
  date,
  boolean,
  varchar,
  timestamp,
  unique,
  real,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '../auth/schema';
import { bots } from '../bot/schema';

export const statusEnum = pgEnum('status', [
  'queued',
  'processing',
  'distributing',
  'completed',
  'failed',
  'distribution failed',
]);

export const song = pgTable('songs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  botId: uuid('bot_id').references(() => bots.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }),
  lyrics: text('lyrics'),
  instrumental: boolean('instrumental').default(false).notNull(),
  prompt: text('prompt'),
  fullyDescribedSong: text('fully_described_song'),
  describedLyrics: text('described_lyrics'),
  audioS3Key: text('audio_s3_key'),
  coverS3Key: text('cover_s3_key'),
  shareTo: text('share_to').array().default([]).notNull(),
  status: statusEnum('status').default('queued').notNull(),
  guidanceScale: real('guidance_scale'),
  duration: integer('duration'), // in seconds
  inferStep: real('infer_step'),
  seed: integer('seed'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const songVideo = pgTable('song_videos', {
  id: uuid('id').defaultRandom().primaryKey(),
  songId: uuid('song_id')
    .notNull()
    .references(() => song.id, { onDelete: 'cascade' }),
  videoS3Key: text('video_s3_key').notNull(),
  videoType: varchar('video_type', { length: 50 }).notNull(),
  video_prompt: text('video_prompt'),
  youtube_url: text('youtube_url'),
  youtube_description: text('youtube_description'),
  thumbnailS3Key: text('thumbnail_s3_key'),
  thumbnail_prompt: text('thumbnail_prompt'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const songRelations = relations(song, ({ one, many }) => ({
  user: one(users, { fields: [song.userId], references: [users.id] }),
  bot: one(bots, { fields: [song.botId], references: [bots.id] }),
  songVideos: many(songVideo),
}));
export const songVideoRelations = relations(songVideo, ({ one }) => ({
  song: one(song, { fields: [songVideo.songId], references: [song.id] }),
}));

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
});

export const songCategories = pgTable(
  'song_categories',
  {
    songId: uuid('song_id')
      .notNull()
      .references(() => song.id, { onDelete: 'no action' }),
    categoryId: integer('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'no action' }),
  },
  (table) => [primaryKey({ columns: [table.songId, table.categoryId] })],
);

export const songCategoriesRelations = relations(songCategories, ({ one }) => ({
  song: one(song, { fields: [songCategories.songId], references: [song.id] }),
  category: one(categories, {
    fields: [songCategories.categoryId],
    references: [categories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  songCategories: many(songCategories),
}));

export const songsCategoriesRelations = relations(song, ({ many }) => ({
  songCategories: many(songCategories),
}));
