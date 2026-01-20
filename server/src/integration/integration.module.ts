import { Module, forwardRef } from '@nestjs/common';
import { IntegrationController } from './integration.controller';
import { AudiusService } from './audius/audius.service';
import { YoutubeService } from './youtube/youtube.service';
import { FacebookService } from './facebook/facebook.service';
import { ConfigModule } from '@nestjs/config';
import { IntegrationService } from './integration.service';
import { DbModule } from '../db/db.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [ConfigModule, DbModule, AuthModule, MailModule],
  controllers: [IntegrationController],
  providers: [
    AudiusService,
    YoutubeService,
    FacebookService,
    IntegrationService,
  ],
  exports: [AudiusService, YoutubeService, FacebookService, IntegrationService],
})
export class IntegrationModule {}
