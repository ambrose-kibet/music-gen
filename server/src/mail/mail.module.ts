import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { MAIL_QUEUE } from './constants';
import { EmailProcessor } from './mail.processor';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: MAIL_QUEUE,
    }),
  ],
  providers: [EmailProcessor, MailService],
  exports: [MailService],
})
export class MailModule {}
