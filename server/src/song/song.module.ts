import { Module } from '@nestjs/common';
import { SongService } from './song.service';
import { SongController } from './song.controller';
import { DbModule } from '../db/db.module';
import { SongProcessor } from './song.processor';
import { SONG_QUEUE, DISTRIBUTION_QUEUE } from './constants';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { DistributionService } from './distribution.service';
import { IntegrationModule } from '../integration/integration.module';
import { DistributionProcessor } from './distribution.processor';
import { AuthModule } from '../auth/auth.module';
import { SongOwnershipGuard } from './guards/song-ownership.guard';

@Module({
  providers: [
    SongService,
    SongProcessor,
    DistributionService,
    DistributionProcessor,
    SongOwnershipGuard,
  ],
  controllers: [SongController],
  exports: [SongService],
  imports: [
    DbModule,
    ConfigModule,
    IntegrationModule,
    AuthModule,
    BullModule.registerQueue(
      {
        name: SONG_QUEUE,
      },
      {
        name: DISTRIBUTION_QUEUE,
      },
    ),
  ],
})
export class SongModule {}
