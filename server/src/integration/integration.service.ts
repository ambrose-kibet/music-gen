import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { DATABASE_CONNECTION } from '../db/db-connection';
import { eq, not, or, and, sql, inArray, asc, desc } from 'drizzle-orm';

@Injectable()
export class IntegrationService {
  constructor(
    @Inject(DATABASE_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async upsertIntegration({
    userId,
    type,
    credentials,
  }: {
    userId: string;
    type: (typeof schema.integrations.type.enumValues)[number];
    credentials: string;
  }) {
    const result = await this.db
      .insert(schema.integrations)
      .values({
        userId,
        type: type,
        credentials,
      })
      .onConflictDoUpdate({
        target: [schema.integrations.userId, schema.integrations.type],
        set: {
          credentials,
        },
      })
      .returning({
        id: schema.integrations.id,
        type: schema.integrations.type,
      });
    return result[0];
  }

  async removeCredentials({
    userId,
    type,
  }: {
    userId: string;
    type: (typeof schema.integrations.type.enumValues)[number];
  }) {
    const result = await this.db
      .delete(schema.integrations)
      .where(
        and(
          eq(schema.integrations.userId, userId),
          eq(schema.integrations.type, type),
        ),
      )
      .returning();
    return result;
  }

  async getIntegrationsByUserId(userId: string) {
    const result = await this.db
      .select()
      .from(schema.integrations)
      .where(eq(schema.integrations.userId, userId));
    return result;
  }

  async getIntegrationByType({
    userId,
    type,
  }: {
    userId: string;
    type: typeof schema.integrations.$inferSelect.type;
  }) {
    const result = await this.db.query.integrations.findFirst({
      where: and(
        eq(schema.integrations.userId, userId),
        eq(schema.integrations.type, type),
      ),
      columns: {
        id: true,
        userId: true,
        type: true,
        credentials: true,
      },
      with: {
        user: {
          columns: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return result;
  }

  async deleteIntegration({
    integrationId,
    userId,
  }: {
    integrationId: string;
    userId: string;
  }) {
    const result = await this.db
      .delete(schema.integrations)
      .where(
        and(
          eq(schema.integrations.id, integrationId),
          eq(schema.integrations.userId, userId),
        ),
      )
      .returning();
    return result;
  }
  async getUserIntegrations({
    userId,
    integrations,
  }: {
    userId: string;
    integrations: (typeof schema.integrations.$inferSelect.type)[];
  }) {
    const result = await this.db
      .select({
        type: schema.integrations.type,
        credentials: schema.integrations.credentials,
      })
      .from(schema.integrations)
      .where(
        and(
          eq(schema.integrations.userId, userId),
          inArray(schema.integrations.type, integrations),
          not(eq(schema.integrations.credentials, '')),
        ),
      )
      .orderBy(asc(schema.integrations.type));
    return result;
  }
}
