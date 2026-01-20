import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IntegrationService } from '../integration.service';
import { encrypt, decrypt } from '../../utils/encryption-helpers';
import axios from 'axios';
import fs from 'fs';
import { FacebookPageResponse } from '../../utils/types';

@Injectable()
export class FacebookService {
  private readonly logger = new Logger(FacebookService.name);
  private readonly facebookAPIVersion = 'v21.0';

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly integrationService: IntegrationService,
  ) {}

  initiateOAuthFlow(userId: string): string {
    const state = this.jwtService.sign(
      { userId },
      {
        secret: this.configService.get<string>('META_STATE_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('META_STATE_EXPIRATION_TIME'),
      },
    );
    const url = `https://www.facebook.com/${this.facebookAPIVersion}/dialog/oauth?client_id=${this.configService.get('META_APP_ID')}&redirect_uri=${this.configService.get('META_REDIRECT_URI')}&state=${state}&scope=pages_show_list,pages_read_engagement,pages_manage_posts,public_profile`;
    return url;
  }

  async getAccessToken({ code, state }: { code: string; state: string }) {
    const redirectUri = this.configService.get<string>('META_REDIRECT_URI');
    try {
      const tokenResponse = await axios.get(
        `https://graph.facebook.com/${this.facebookAPIVersion}/oauth/access_token`,
        {
          params: {
            client_id: this.configService.get('META_APP_ID'),
            client_secret: this.configService.get('META_APP_SECRET'),
            redirect_uri: redirectUri,
            code: code,
          },
        },
      );

      const accessToken = tokenResponse.data.access_token;
      const machineID = tokenResponse.data.machine_id;

      this.logger.log(
        `Obtained access token from Facebook for machine ID: ${machineID}`,
      );

      // Decode state to get userId
      if (!state) {
        throw new Error('State parameter is missing');
      }
      const decodedState = this.jwtService.verify(state, {
        secret: this.configService.get<string>('META_STATE_TOKEN_SECRET'),
      });
      const userId = decodedState.userId;
      //   request long-lived token

      const longLivedTokenResponse = await axios.get(
        `https://graph.facebook.com/${this.facebookAPIVersion}/oauth/access_token`,
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: this.configService.get('META_APP_ID'),
            client_secret: this.configService.get('META_APP_SECRET'),
            fb_exchange_token: accessToken,
          },
        },
      );

      const longLivedAccessToken = longLivedTokenResponse.data.access_token;

      //  use permanent page access tokens
      const pages = await this.getMyPages(longLivedAccessToken);

      if (pages.pages.length === 0) {
        throw new Error('No Facebook pages found for the user');
      }
      const pageAccessToken = pages.pages[0].access_token;
      const pageId = pages.pages[0].id;

      this.logger.log(
        `Using page ID: ${pageId} for Facebook integration for user ID: ${userId}`,
      );
      const authData = JSON.stringify({
        accessToken: pageAccessToken,
        pageId: pageId,
      });
      // Encrypt and store tokens
      const encryptedAccessToken = encrypt(
        authData,
        this.configService.get<string>('ENCRYPTION_KEY')!,
      );
      const integrationData = await this.integrationService.upsertIntegration({
        userId,
        type: 'facebook',
        credentials: encryptedAccessToken,
      });

      return integrationData;
    } catch (error) {
      this.logger.error('Error in getAccessToken:', error);
      throw error;
    }
  }

  async getMyPages(
    userAccessToken: string,
  ): Promise<{ pages: FacebookPageResponse[] }> {
    try {
      const response = await axios.get<{ data: FacebookPageResponse[] }>(
        `https://graph.facebook.com/${this.facebookAPIVersion}/me/accounts`,
        {
          params: {
            access_token: userAccessToken,
          },
        },
      );

      return { pages: response.data.data };
    } catch (error) {
      this.logger.error('Error fetching Facebook pages:', error);
      throw error;
    }
  }

  async publishMediaToPageStory({
    mediaPath,
    caption,
    userId,
  }: {
    mediaPath: string;
    caption?: string;
    userId: string;
  }) {
    try {
      //0. Get Page Access Token & Page ID from stored integration
      const integration = await this.integrationService.getIntegrationByType({
        userId,
        type: 'facebook',
      });
      if (!integration) {
        throw new Error('Facebook integration not found for user');
      }
      const decrypted = decrypt(
        integration.credentials,
        this.configService.get<string>('ENCRYPTION_KEY')!,
      );
      const parsed = JSON.parse(decrypted);

      const { accessToken, pageId } = parsed;
      if (!accessToken || !pageId) {
        throw new Error(
          'Facebook access token or page ID missing in integration credentials',
        );
      }

      // 1. START UPLOAD
      const startRes = await axios.post(
        `https://graph.facebook.com/${this.facebookAPIVersion}/${pageId}/video_reels`,
        null,
        {
          params: {
            access_token: accessToken,
            upload_phase: 'start',
          },
        },
      );

      const { upload_url, video_id } = startRes.data;

      console.log('uploading to url', upload_url, 'video id', video_id);
      if (!upload_url || !video_id) {
        throw new Error('Upload URL or video ID missing from start response');
      }

      // 2. UPLOAD VIDEO BYTES (NO CHUNKED ENCODING)
      const fileBuffer = fs.readFileSync(mediaPath);
      const fileSize = fileBuffer.length;

      await axios.post(upload_url, fileBuffer, {
        headers: {
          Authorization: `OAuth ${accessToken}`,
          offset: '0',
          file_size: fileSize.toString(),
          'Content-Type': 'application/octet-stream',
          'Content-Length': fileSize.toString(),
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      // 3. OPTIONAL: POLL UPLOAD / PROCESSING STATUS
      const MAX_ATTEMPTS = 60;
      const BASE_INTERVAL = 5000; // base backoff in ms
      const MAX_INTERVAL = 120000; // cap backoff at 2 minutes

      let attempt = 0;

      while (attempt < MAX_ATTEMPTS) {
        const { data } = await axios.get(
          `https://graph.facebook.com/v24.0/${video_id}`,
          {
            params: {
              fields: 'status',
              access_token: accessToken,
            },
          },
        );

        const status = data.status?.video_status;

        if (status === 'upload_complete') {
          // 4. FINISH UPLOADING / PUBLISHING
          const pubRes = await axios.post(
            `https://graph.facebook.com/v24.0/${pageId}/video_reels`,
            null,
            {
              params: {
                access_token: accessToken,
                upload_phase: 'finish',
                video_id,
                video_state: 'PUBLISHED',
                ...(caption ? { description: caption } : {}),
              },
            },
          );

          if (pubRes.data?.success) {
            return {
              video_id,
              success: true,
            };
          }
          // If finish call didn't report success, continue polling
        }

        attempt++;

        // exponential backoff with jitter and cap
        const exponential = Math.pow(2, attempt - 1);
        const jitterFactor = 0.75 + Math.random() * 0.5; // 0.75 - 1.25
        const delay = Math.min(
          BASE_INTERVAL * exponential * jitterFactor,
          MAX_INTERVAL,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      return { video_id, success: false };
    } catch (err) {
      this.logger.error('Facebook Page Story upload failed', err);
      throw err;
    }
  }
  async publishMediaToPageFeed({
    pageId,
    mediaPath,
    accessToken,
    description,
    title,
    userId,
    userAccessToken,
  }: {
    pageId: string;
    mediaPath: string;
    accessToken: string;
    description?: string;
    title?: string;
    userAccessToken: string;
    userId: string;
  }): Promise<string | undefined> {
    try {
      const appID = this.configService.get('META_APP_ID')!;
      const fileBuffer = fs.readFileSync(mediaPath);
      const fileSize = fileBuffer.length;
      const fileName = mediaPath.split('/').pop();
      const SMALL_FILE_THRESHOLD = 5 * 1024 * 1024; // 5 MB
      const CHUNK_SIZE = 2 * 1024 * 1024;

      /* ──────────────────────────────
       1️⃣ START UPLOAD SESSION
       ────────────────────────────── */
      const startRes = await axios.post(
        `https://graph.facebook.com/v24.0/${appID}/uploads`,
        null,
        {
          params: {
            file_name: fileName,
            file_length: fileSize.toString(),
            file_type: 'video/mp4',
            access_token: userAccessToken,
          },
        },
      );

      const uploadSessionId: string = startRes.data.id;
      if (!uploadSessionId) {
        throw new Error('Upload session ID missing');
      }

      /* ──────────────────────────────
       2️⃣ UPLOAD FILE 
       ────────────────────────────── */
      let fileHandle: string;

      if (fileSize <= SMALL_FILE_THRESHOLD) {
        // 2️⃣ Single POST for small files
        const uploadRes = await axios.post(
          `https://graph.facebook.com/v24.0/${uploadSessionId}`,
          fileBuffer,
          {
            headers: {
              Authorization: `OAuth ${userAccessToken}`,
              file_offset: '0',
              'Content-Type': 'application/octet-stream',
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          },
        );

        fileHandle = uploadRes.data.h;
        if (!fileHandle) throw new Error('Failed to get uploaded file handle');
      } else {
        // 2️⃣ Chunked upload for large files
        fileHandle = '';
        let offset = 0;

        while (offset < fileSize) {
          const chunkEnd = Math.min(offset + CHUNK_SIZE, fileSize);
          const chunk = fileBuffer.slice(offset, chunkEnd);

          const uploadRes = await axios.post(
            `https://graph.facebook.com/v24.0/${uploadSessionId}`,
            chunk,
            {
              headers: {
                Authorization: `OAuth ${userAccessToken}`,
                file_offset: offset.toString(),
                'Content-Type': 'application/octet-stream',
              },
              maxContentLength: Infinity,
              maxBodyLength: Infinity,
            },
          );

          if (uploadRes.data.h) {
            fileHandle = uploadRes.data.h;
          }

          const offsetRes = await axios.get(
            `https://graph.facebook.com/v24.0/${uploadSessionId}`,
            {
              headers: { Authorization: `OAuth ${userAccessToken}` },
            },
          );
          offset = Number(offsetRes.data.file_offset);
        }

        if (!fileHandle)
          throw new Error('Failed to get final uploaded file handle');
      }

      fileHandle = fileHandle.split('\n')[0];

      /* ──────────────────────────────
       3️⃣ FINISH UPLOAD
       ────────────────────────────── */
      const publishRes = await axios.post(
        `https://graph-video.facebook.com/v24.0/${pageId}/videos`,
        {
          access_token: accessToken,
          title: title ?? '',
          description: description ?? '',
          fbuploader_video_file_chunk: fileHandle!.trim(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      console.log('Intermediate publish response:', publishRes.data?.id);

      return publishRes.data.id;
    } catch (err) {
      // delete integration in case of expired token
      if (
        axios.isAxiosError(err) &&
        err.response &&
        err.response.status === 400 &&
        err.response.data.error &&
        (err.response.data.error.code === 190 ||
          err.response.data.error.code === 102)
      ) {
        this.logger.warn(
          `Facebook token expired for page ID: ${pageId}. Deleting integration.`,
        );
        const integration = await this.integrationService.getIntegrationByType({
          userId,
          type: 'facebook',
        });
        if (integration) {
          await this.integrationService.deleteIntegration({
            integrationId: integration.id,
            userId,
          });
        }
        this.logger.error('Facebook Page Feed upload failed', err);
        throw err;
      }
    }
  }
}
