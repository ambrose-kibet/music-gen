import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BotService } from './bot.service';
import { BOT_QUEUE } from './constants';
import { SongService } from '../song/song.service';
import { Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

@Processor(BOT_QUEUE, { concurrency: 1 })
export class BotProcessor extends WorkerHost {
  private readonly logger = new Logger(BotProcessor.name);
  constructor(
    private readonly botService: BotService,
    private readonly songService: SongService,
    private readonly mailService: MailService,
  ) {
    super();
  }

  async process(job: Job<{ botId: string }>): Promise<void> {
    try {
      const { botId } = job.data;
      this.logger.log(`Processing bot job for Bot ID: ${botId}`);

      const bot = await this.botService.getBotWithUser(botId);
      const unParsedRequests = bot.bots.requests || '[]';
      const requests = JSON.parse(unParsedRequests) as Array<{
        prompt: string;
        shareTo: string[];
      }>;

      let creditsNeeded = requests.length * 3;

      if (bot.users.credits < creditsNeeded) {
        this.logger.log(`Bot ID ${botId} skipped due to insufficient credits.`);
        //disable bot
        await this.botService.updateBot({
          botId,
          data: { isActive: false },
        });
        // trigger credit top-up notification

        const message = `Your bot "${bot.bots.name}" has been deactivated due to insufficient credits. Please top up your credits and  reactivate your bot and continue generating music.`;

        const body = this.mailService.populateNotificationEmailTemplate({
          name: bot.users.name,
          message,
          title: 'Bot Deactivated - Insufficient Credits',
        });
        await this.mailService.sendMail({
          to: bot.users.email,
          subject: 'Bot Deactivated - Insufficient Credits',
          body,
        });

        return;
      }
      let songIds: string[] = [];
      for (const request of requests) {
        const song = await this.songService.createSong({
          data: {
            prompt: request.prompt,
            instrumental: true,
            describedLyrics: undefined,
            fullyDescribedSong: undefined,
            lyrics: undefined,
            shareTo: request.shareTo,
            durationInSeconds: 100 + Math.floor(Math.random() * 11),
          },
          userId: bot.users.id,
          botId: bot.bots.id,
        });
        songIds.push(song.id);
      }

      const queuedSongs =
        await this.songService.queueSongsForProcessing(songIds);
      this.logger.log(
        `Bot ID ${botId} processed. Queued Song IDs: ${queuedSongs.queuedSongIds.join(', ')}`,
      );
    } catch (error) {
      this.logger.error('Error processing bot job:', error);
    }
  }
}
