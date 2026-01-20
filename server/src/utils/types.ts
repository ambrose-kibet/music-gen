import { type Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: 'USER' | 'ADMIN';
  credits: number;
}

export type TokenPayload = {
  userId: string;
};

export interface AccessTokenPayload extends AuthUser {}
export interface RequestWithUser extends Request {
  user: AuthUser;
  resource?: any;
}

export interface ProcessSongInterface {
  request_type: 'short' | 'song';
  id: string;
  user_id: string;
  bot_id: string | null;
  lyrics: string | null;
  instrumental: boolean;
  prompt: string | null;
  fully_described_song: string | null;
  described_lyrics: string | null;
  audio_s3_key: string | null;
  cover_s3_key: string | null;
  videos: never[];
  status:
    | 'queued'
    | 'processing'
    | 'distributing'
    | 'completed'
    | 'failed'
    | 'distribution failed';
}
export type VideoType = 'short' | 'song';

export interface VideoResponse {
  id: string;
  video_s3_key: string;
  thumbnail_s3_key: string;
  thumbnail_prompt: string;
  video_prompt?: string;
  youtube_url?: string;
  youtube_description: string;
  video_type: VideoType;
}

export interface GenerateSongResponse {
  request_type: VideoType;
  id: string;
  user_id: string;
  bot_id?: string;
  title: string;
  lyrics?: string;
  instrumental: boolean;
  prompt: string;
  fully_described_song?: string;
  described_lyrics?: string;
  audio_s3_key: string;
  cover_s3_key: string;
  videos: VideoResponse[];
  song_categories: string[];
  status: string;
  guidance_scale: number;
  duration: number;
  infer_step: number;
  seed: number;
}

export interface FacebookPageResponse {
  access_token: string;
  category: string;
  category_list: FacebookPageCategory[];
  name: string;
  id: string;
  tasks: FacebookPageTask[];
}

export interface FacebookPageCategory {
  id: string;
  name: string;
}

export type FacebookPageTask =
  | 'ANALYZE'
  | 'ADVERTISE'
  | 'MODERATE'
  | 'CREATE_CONTENT'
  | 'MANAGE'
  | 'MESSAGING'
  | 'PUBLISH'
  | 'READ_INSIGHTS';

export type OwnershipMeta = {
  ownerField?: string;
  allowedRoles?: string[];
};
