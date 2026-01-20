export interface User {
  id: string;
  name: string;
  avatar: string | null;
  userRole: string;
  credits: number;
}
export interface AuthResponse extends User {}

export interface MyBot {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface BotResponse extends MyBot {
  requests: string;
  frequency: (
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
  )[];
  userId: string;
}

export interface PromptDetails {
  prompt: string;
  shareTo: ("facebook" | "whatsapp" | "youtube" | "audius")[];
}
export type SongsResponse = {
  songs: Array<{
    id: string;
    title?: string;
    status: string;
    coverS3Key?: string;
    createdAt: string;
  }>;
  total: number;
};
