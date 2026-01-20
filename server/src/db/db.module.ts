import { Module } from '@nestjs/common';
import { DATABASE_CONNECTION } from './db-connection';
import { IConfigService } from '../config/env.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { RedisService } from './redis/redis.service';
import * as authSchema from '../auth/schema';

import * as integrationSchema from '../integration/schema';
import * as botSchema from '../bot/schema';
import * as songSchema from '../song/schema';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL');
        const pool = new Pool({
          connectionString: dbUrl,
        });
        return drizzle(pool, {
          schema: {
            ...authSchema,
            ...integrationSchema,
            ...botSchema,
            ...songSchema,
          },
          logger: false,
        });
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [DATABASE_CONNECTION, RedisService],
})
export class DbModule {}
