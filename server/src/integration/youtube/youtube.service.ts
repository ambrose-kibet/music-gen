import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { google } from 'googleapis';
import { IntegrationService } from '../integration.service';
import { encrypt, decrypt } from '../../utils/encryption-helpers';
import fs from 'fs';
import { tr } from 'zod/v4/locales';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class YoutubeService {
  private youtube = google.youtube('v3');
  private readonly logger = new Logger(YoutubeService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly integrationService: IntegrationService,
    private readonly mailService: MailService,
  ) {}

  initiateOAuthFlow(userId: string): string {
    const oauth2Client = this.createOAuthClient();
    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/userinfo.email',
      'openid',
    ];
    const state = this.jwtService.sign(
      { userId },
      {
        secret: this.configService.get<string>('GOOGLE_STATE_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>(
          'GOOGLE_STATE_EXPIRATION_TIME',
        ),
      },
    );
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
      state: state,
    });
    return url;
  }

  async getAccessToken({ code, state }: { code: string; state: string }) {
    const oauth2Client = this.createOAuthClient();
    try {
      const { tokens } = await oauth2Client.getToken(code);
      //decode state to get userId
      if (!state) {
        throw new Error('State parameter is missing');
      }
      if (!tokens.refresh_token) {
        throw new Error('Refresh token is missing in the response');
      }
      const decodedState = this.jwtService.verify(state, {
        secret: this.configService.get<string>('GOOGLE_STATE_TOKEN_SECRET'),
      });
      const userId = decodedState.userId;

      // Encrypt and store tokens
      const encryptedRefreshToken = encrypt(
        tokens.refresh_token,
        this.configService.get<string>('ENCRYPTION_KEY')!,
      );

      const integrationData = await this.integrationService.upsertIntegration({
        userId,
        type: 'youtube',
        credentials: encryptedRefreshToken,
      });

      return integrationData;
    } catch (error) {
      this.logger.error('Error in getRefreshToken:', error);
      throw error;
    }
  }

  async uploadVideo({
    userId,
    videoPath,
    title,
    description,
    tags,
    thumbnailPath,
  }: {
    userId: string;
    videoPath: string;
    title: string;
    description: string;
    thumbnailPath: string;
    tags: string[];
  }) {
    this.logger.log(`Uploading video for user ID: ${userId} title: ${title}`);
    const integration = await this.integrationService.getIntegrationByType({
      userId,
      type: 'youtube',
    });
    try {
      if (!integration) {
        this.logger.error('YouTube integration not found for user:', userId);
        throw new Error('YouTube integration not found for user');
      }
      const decryptedRefreshToken = decrypt(
        integration.credentials,
        this.configService.get<string>('ENCRYPTION_KEY')!,
      );

      const oauth2Client = this.createOAuthClient(userId);
      oauth2Client.on('tokens', async (tokens) => {
        if (tokens.refresh_token && userId) {
          this.logger.log(`New google refresh token for user ${userId}`);

          const encryptedRefreshToken = encrypt(
            tokens.refresh_token,
            this.configService.get<string>('ENCRYPTION_KEY')!,
          );
          await this.integrationService.upsertIntegration({
            userId: userId,
            type: 'youtube',
            credentials: encryptedRefreshToken,
          });
        }
        this.logger.log(`New google access token for user ${userId}`);
      });
      oauth2Client.setCredentials({
        refresh_token: decryptedRefreshToken,
      });

      const youtube = google.youtube({
        version: 'v3',
        auth: oauth2Client,
      });

      const res = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title,
            description,
            tags,
            categoryId: '10', // Music category
          },

          status: {
            privacyStatus: 'public',
          },
        },
        media: {
          body: fs.createReadStream(videoPath),
        },
      });
      if (res.data.id && thumbnailPath) {
        await youtube.thumbnails.set({
          videoId: res.data.id,
          media: {
            body: fs.createReadStream(thumbnailPath),
          },
        });
      }

      return `https://www.youtube.com/watch?v=${res.data.id}`;
    } catch (error) {
      this.logger.error('Error uploading video to YouTube:', error);
      //check if error is due to invalid or expired token
      if (
        error instanceof Error &&
        (error.message.includes('invalid_grant') ||
          error.message.includes('Token has been expired'))
      ) {
        this.logger.log(
          `YouTube token expired or invalid for user ${userId}, removing integration.`,
        );
        await this.integrationService.removeCredentials({
          type: 'youtube',
          userId,
        });
        // send notification to user to re-authenticate
        const message = `Your YouTube integration has been disconnected due to expired or invalid tokens. Please reconnect your YouTube account to continue uploading videos.`;

        const body = this.mailService.populateNotificationEmailTemplate({
          name: (integration?.user as any).name || 'User',
          message,
          title: 'YouTube Integration Disconnected',
        });
        //fetch user email from database
        //send email
        await this.mailService.sendMail({
          to: (integration?.user as any).email,
          subject: 'YouTube Integration Disconnected',
          body,
        });
      }

      throw error;
    }
  }

  private createOAuthClient(userId?: string) {
    const oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    );

    return oauth2Client;
  }
}
