import {
  pgTable,
  serial,
  text,
  pgEnum,
  integer,
  uuid,
  date,
  varchar,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { song } from '../song/schema';
import { integrations } from '../integration/schema';
import { bots } from '../bot/schema';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('user_role', ['USER', 'ADMIN']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  password: text('password'),
  avatar: text('avatar'),
  userRole: roleEnum('user_role').default('USER').notNull(),
  credits: integer('credits').default(0).notNull(),
  refreshToken: text('refresh_token'),
  emailConfirmed: timestamp('email_confirmed'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  songs: many(song),
  integrations: many(integrations),
  bots: many(bots),
}));

export const verificationCodes = pgTable(
  'verification_codes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    code: varchar('code', { length: 6 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  (table) => [
    unique().on(table.email, table.code),
    unique('verification_code_email').on(table.email, table.code),
  ],
);

export const passwordResetTokens = pgTable(
  'password_reset_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    token: text('token').notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  (table) => [
    unique().on(table.email, table.token),
    unique('password_reset_token_email').on(table.email, table.token),
  ],
);
