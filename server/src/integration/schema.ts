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
import { relations } from 'drizzle-orm';
import { users } from '../auth/schema';

export const integrationTypeEnum = pgEnum('integration_type', [
  'whatsapp',
  'audius',
  'youtube',
  'facebook',
]);

export const integrations = pgTable(
  'integrations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: integrationTypeEnum('type').notNull(),
    credentials: text('credentials').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    unique('user_integration_type_unique').on(table.userId, table.type),
  ],
);

export const integrationsRelations = relations(integrations, ({ one }) => ({
  user: one(users, { fields: [integrations.userId], references: [users.id] }),
}));
