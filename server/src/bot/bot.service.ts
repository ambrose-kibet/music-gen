import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { users } from '../auth/schema';
import { DATABASE_CONNECTION } from '../db/db-connection';
import {
  eq,
  not,
  or,
  and,
  desc,
  asc,
  gte,
  arrayContains,
  sql,
} from 'drizzle-orm';
import { CreateBotDto } from './Dtos/create-bot.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BOT_JOB, BOT_QUEUE } from './constants';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BotService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase,
    @InjectQueue(BOT_QUEUE) private readonly botQueue: Queue,
  ) {}

  async createBot({
    data: createBotDto,
    userId,
  }: {
    data: CreateBotDto;
    userId: string;
  }) {
    const newBot = await this.db
      .insert(schema.bots)
      .values({
        userId,
        name: createBotDto.name,
        description: createBotDto.description,
        requests: createBotDto.requests,
        frequency: createBotDto.frequency,
        isActive: createBotDto.isActive,
      })
      .returning({
        id: schema.bots.id,
      });
    return newBot[0];
  }

  async getUserBots(userId: string) {
    const bots = await this.db
      .select({
        id: schema.bots.id,
        name: schema.bots.name,
        description: schema.bots.description,
        isActive: schema.bots.isActive,
        createdAt: schema.bots.createdAt,
      })
      .from(schema.bots)
      .where(eq(schema.bots.userId, userId))
      .orderBy(desc(schema.bots.createdAt));
    return bots;
  }

  async getBotById(botId: string) {
    const bot = await this.db
      .select()
      .from(schema.bots)
      .where(eq(schema.bots.id, botId))
      .limit(1);
    if (bot.length === 0) {
      throw new NotFoundException(`Bot with ID ${botId} not found`);
    }
    return bot[0];
  }
  async getBotWithUser(botId: string) {
    const bot = await this.db
      .select()
      .from(schema.bots)
      .where(eq(schema.bots.id, botId))
      .innerJoin(users, eq(schema.bots.userId, users.id))
      .limit(1);

    if (bot.length === 0) {
      throw new NotFoundException(`Bot with ID ${botId} not found`);
    }
    return bot[0];
  }

  async updateBot({
    botId,
    data,
  }: {
    botId: string;
    data: Partial<typeof schema.bots.$inferInsert>;
  }) {
    const updatedBot = await this.db
      .update(schema.bots)
      .set({
        description: data.description,
        name: data.name,
        frequency: data.frequency,
        isActive: data.isActive,
        requests: data.requests,
      })
      .where(eq(schema.bots.id, botId))
      .returning({
        id: schema.bots.id,
        description: schema.bots.description,
        isActive: schema.bots.isActive,
        createdAt: schema.bots.createdAt,
      });
    if (updatedBot.length === 0) {
      throw new NotFoundException(`Bot with ID ${botId} not found`);
    }
    return updatedBot[0];
  }

  async getActiveBotsForRequest() {
    const day = new Date()
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();

    const bots = await this.db
      .select({
        id: schema.bots.id,
      })
      .from(schema.bots)
      .innerJoin(users, eq(schema.bots.userId, users.id))
      .where(
        and(
          eq(schema.bots.isActive, true),
          gte(users.credits, 3),
          arrayContains(schema.bots.frequency, [day]),
        ),
      )
      .orderBy(asc(schema.bots.createdAt));

    return bots;
  }

  //runs once at 7:00 AM every day
  @Cron('30 5 * * *')
  async queueActiveBots() {
    const bots = await this.getActiveBotsForRequest();
    for (const bot of bots) {
      await this.botQueue.add(
        BOT_JOB,
        { botId: bot.id },
        { removeOnComplete: true, removeOnFail: true },
      );
    }
  }
}

