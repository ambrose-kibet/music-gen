import { Injectable } from '@nestjs/common';
import { IntegrationService } from '../integration.service';
// import { Mood, Genre, sdk } from '@audius/sdk';
import fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { ca } from 'zod/v4/locales';

@Injectable()
export class AudiusService {
  constructor(
    private readonly integrationService: IntegrationService,
    private readonly configService: ConfigService,
  ) {}

  async upsertAudiusCredentials({
    userId,
    audiusUserId,
  }: {
    userId: string;
    audiusUserId: string;
  }) {
    // Implementation here
    return this.integrationService.upsertIntegration({
      userId,
      type: 'audius',
      credentials: audiusUserId,
    });
  }

  // async uploadToAudius({
  //   userId,
  //   audioPath,
  //   title,
  //   description,
  //   tags,
  //   thumbnailPath,
  // }: {
  //   userId: string;
  //   audioPath: string;
  //   title: string;
  //   description: string;
  //   thumbnailPath: string;
  //   tags: string[];
  // }) {
  //   const integration = await this.integrationService.getIntegrationByType({
  //     type: 'audius',
  //     userId,
  //   });
  //   if (!integration) {
  //     throw new Error('Audius credentials not found for user');
  //   }
  //   const audiusUserId = integration.credentials;
  //   const audiusClient = this.createAudiusClient(audiusUserId);

  //   const audioBuffer = fs.readFileSync(audioPath);
  //   const thumbnailBuffer = fs.readFileSync(thumbnailPath);

  //   const { mood, genre } = this.getMoodAndGenreFromTags(tags);

  //   // Determine mood value
  //   try {
  //     const { trackId } = await audiusClient.tracks.uploadTrack({
  //       userId: audiusUserId,
  //       trackFile: {
  //         buffer: Buffer.from(audioBuffer),
  //         name: `${title}-audio`,
  //       },
  //       coverArtFile: {
  //         buffer: Buffer.from(thumbnailBuffer),
  //         name: `${title}-coverArt`,
  //       },
  //       metadata: {
  //         title,
  //         description,
  //         tags: tags.join(','),
  //         genre: genre,
  //         mood: mood,
  //       },
  //     });
  //     console.log('Uploaded track to Audius with ID:', trackId);
  //     return trackId;
  //   } catch (error) {
  //     console.error('Error uploading track to Audius:', error);
  //     throw error;
  //   }
  // }

  // private createAudiusClient(audiusUserId: string) {
  //   const audiusSdk = sdk({
  //     apiKey: this.configService.get('AUDIUS_API_KEY') || '',
  //     apiSecret: this.configService.get('AUDIUS_API_SECRET') || '',
  //     environment: this.configService.get('AUDIUS_ENVIRONMENT') || 'production',
  //     appName: this.configService.get('AUDIUS_APP_NAME') || '',
  //   });
  //   return audiusSdk;
  // }
  // private getMoodAndGenreFromTags(tags: string[]): {
  //   mood: Mood;
  //   genre: Genre;
  // } {
  //   // Simple mapping based on tags
  //   const lowerTags = tags.map((tag) => tag.toLowerCase());
  //   // first 3 describe mood, last 2 describe genre
  //   let moodTags = lowerTags.slice(0, 3);
  //   let genreTags = lowerTags.slice(-2);

  //   let moodValue: Mood, genreValue: Genre;
  //   // Map mood tags to Mood enum
  //   if (moodTags.includes(Mood.AGGRESSIVE.toLowerCase())) {
  //     moodValue = Mood.AGGRESSIVE;
  //   } else if (moodTags.includes(Mood.BROODING.toLowerCase())) {
  //     moodValue = Mood.BROODING;
  //   } else if (moodTags.includes(Mood.COOL.toLowerCase())) {
  //     moodValue = Mood.COOL;
  //   } else if (moodTags.includes(Mood.DEFIANT.toLowerCase())) {
  //     moodValue = Mood.DEFIANT;
  //   } else if (moodTags.includes(Mood.EASYGOING.toLowerCase())) {
  //     moodValue = Mood.EASYGOING;
  //   } else if (moodTags.includes(Mood.EMPOWERING.toLowerCase())) {
  //     moodValue = Mood.EMPOWERING;
  //   } else if (moodTags.includes(Mood.ENERGIZING.toLowerCase())) {
  //     moodValue = Mood.ENERGIZING;
  //   } else if (moodTags.includes(Mood.EXCITED.toLowerCase())) {
  //     moodValue = Mood.EXCITED;
  //   } else if (moodTags.includes(Mood.FIERY.toLowerCase())) {
  //     moodValue = Mood.FIERY;
  //   } else if (moodTags.includes(Mood.GRITTY.toLowerCase())) {
  //     moodValue = Mood.GRITTY;
  //   } else if (moodTags.includes(Mood.MELANCHOLY.toLowerCase())) {
  //     moodValue = Mood.MELANCHOLY;
  //   } else if (moodTags.includes(Mood.ROMANTIC.toLowerCase())) {
  //     moodValue = Mood.ROMANTIC;
  //   } else if (moodTags.includes(Mood.SENTIMENTAL.toLowerCase())) {
  //     moodValue = Mood.SENTIMENTAL;
  //   } else if (moodTags.includes(Mood.YEARNING.toLowerCase())) {
  //     moodValue = Mood.YEARNING;
  //   } else if (moodTags.includes(Mood.UPBEAT.toLowerCase())) {
  //     moodValue = Mood.UPBEAT;
  //   } else if (moodTags.includes(Mood.STIRRING.toLowerCase())) {
  //     moodValue = Mood.STIRRING;
  //   } else {
  //     moodValue = Mood.OTHER; // Default mood
  //   }

  //   // Map genre tags to Genre enum
  //   if (genreTags.includes(Genre.POP.toLowerCase())) {
  //     genreValue = Genre.POP;
  //   } else if (genreTags.includes(Genre.ROCK.toLowerCase())) {
  //     genreValue = Genre.ROCK;
  //   } else if (
  //     genreTags.includes(Genre.HIP_HOP_RAP.toLowerCase()) ||
  //     genreTags.includes('hip hop') ||
  //     genreTags.includes('rap') ||
  //     genreTags.includes('hip-hop')
  //   ) {
  //     genreValue = Genre.HIP_HOP_RAP;
  //   } else if (genreTags.includes(Genre.JAZZ.toLowerCase())) {
  //     genreValue = Genre.JAZZ;
  //   } else if (genreTags.includes(Genre.CLASSICAL.toLowerCase())) {
  //     genreValue = Genre.CLASSICAL;
  //   } else if (genreTags.includes(Genre.COUNTRY.toLowerCase())) {
  //     genreValue = Genre.COUNTRY;
  //   } else if (genreTags.includes(Genre.ELECTRONIC.toLowerCase())) {
  //     genreValue = Genre.ELECTRONIC;
  //   } else if (genreTags.includes(Genre.FOLK.toLowerCase())) {
  //     genreValue = Genre.FOLK;
  //   } else if (genreTags.includes(Genre.BLUES.toLowerCase())) {
  //     genreValue = Genre.BLUES;
  //   } else if (genreTags.includes(Genre.REGGAE.toLowerCase())) {
  //     genreValue = Genre.REGGAE;
  //   } else if (genreTags.includes(Genre.METAL.toLowerCase())) {
  //     genreValue = Genre.METAL;
  //   } else if (genreTags.includes(Genre.PUNK.toLowerCase())) {
  //     genreValue = Genre.PUNK;
  //   } else if (genreTags.includes(Genre.SOUNDTRACK.toLowerCase())) {
  //     genreValue = Genre.SOUNDTRACK;
  //   } else if (genreTags.includes(Genre.DANCEHALL.toLowerCase())) {
  //     genreValue = Genre.DANCEHALL;
  //   } else if (genreTags.includes(Genre.DEEP_HOUSE.toLowerCase())) {
  //     genreValue = Genre.DEEP_HOUSE;
  //   } else if (genreTags.includes(Genre.TRAP.toLowerCase())) {
  //     genreValue = Genre.TRAP;
  //   } else if (
  //     genreTags.includes(Genre.LOFI.toLowerCase()) ||
  //     genreTags.includes('lo-fi')
  //   ) {
  //     genreValue = Genre.LOFI;
  //   } else {
  //     genreValue = Genre.HOUSE; // Default genre
  //   }

  //   return { mood: moodValue, genre: genreValue };
  // }
}
