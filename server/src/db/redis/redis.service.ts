import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private static client: RedisClientType;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    if (!RedisService.client) {
      const redisUrl =
        this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

      RedisService.client = createClient({ url: redisUrl });

      RedisService.client.on('error', (err) => {
        this.logger.error('Redis Client Error', err);
      });
    }
  }

  async onModuleInit() {
    if (!RedisService.client.isOpen) {
      await RedisService.client.connect();
      this.logger.log('✅ Connected to Redis');
    }
  }

  getClient(): RedisClientType {
    return RedisService.client;
  }

  async onModuleDestroy() {
    // do NOTHING in watch mode
  }
}
