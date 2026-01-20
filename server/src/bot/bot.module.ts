import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { DbModule } from '../db/db.module';
import { SongModule } from '../song/song.module';
import { BOT_QUEUE } from './constants';
import { BullModule } from '@nestjs/bullmq';
import { BotProcessor } from './bot.processor';
import { BotOwnershipGuard } from './guards/bot-ownership.guard';
import { MailModule } from '../mail/mail.module';

@Module({
  providers: [BotService, BotProcessor, BotOwnershipGuard],
  controllers: [BotController],
  imports: [
    DbModule,
    SongModule,
    BullModule.registerQueue({
      name: BOT_QUEUE,
    }),
    MailModule,
  ],
})
export class BotModule {}
