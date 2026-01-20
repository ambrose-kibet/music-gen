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
  PgArray,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '../auth/schema';
import { song } from '../song/schema';

export const bots = pgTable('bots', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  requests: text('requests').notNull(),
  frequency: text('frequency').array().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const botsRelations = relations(bots, ({ one, many }) => ({
  user: one(users, { fields: [bots.userId], references: [users.id] }),
  songs: many(song),
}));
