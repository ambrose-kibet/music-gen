import { z } from 'zod';
import { ConfigService } from '@nestjs/config';

const envs = z.object({
  DATABASE_URL: z.string(),
  MAIL_SENDER: z.string(),
  NODEMAILER_SECRET: z.string(),
  NODEMAILER_USER: z.string(),
  MAIL_HOST: z.string(),
  REDIS_URL: z.url(),
  CLIENT_URL: z.url(),
  JWT_ACCESS_TOKEN_SECRET: z.string(),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: z.string(),
  JWT_REFRESH_TOKEN_SECRET: z.string(),
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: z.string(),
  JWT_PASSWORD_SECRET: z.string(),
  JWT_PASSWORD_EXPIRATION_TIME: z.string(),
  MODAL_PROXY_KEY: z.string(),
  MODAL_PROXY_SECRET: z.string(),
  GENERATE_SONG_URL: z.string(),
  ENCRYPTION_KEY: z.string().min(5),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string(),
  GOOGLE_STATE_TOKEN_SECRET: z.string(),
  GOOGLE_STATE_EXPIRATION_TIME: z.string(),
  META_APP_ID: z.string(),
  META_APP_SECRET: z.string(),
  META_REDIRECT_URI: z.string(),
  META_STATE_TOKEN_SECRET: z.string(),
  META_STATE_EXPIRATION_TIME: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  AUDIUS_API_KEY: z.string(),
  AUDIUS_API_SECRET: z.string(),
  AUDIUS_APP_NAME: z.string(),
  AUDIUS_ENVIRONMENT: z.string(),
  // NODE_ENV: z.string().optional(),
  // PORT: z.coerce.number().optional(),
  // POSTGRES_USER: z.string(),
  // POSTGRES_PASSWORD: z.string(),
  // POSTGRES_DB: z.string(),
  // BASE_URL: z.string().optional(),
});

export const validate = (config: Record<string, unknown>) => {
  const validated = envs.parse(config);
  return validated;
};
export type IConfigService = ConfigService<z.infer<typeof envs>>;
