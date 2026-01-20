CREATE TABLE "song_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"song_id" uuid NOT NULL,
	"video_s3_key" text NOT NULL,
	"video_type" varchar(50) NOT NULL,
	"video_prompt" text,
	"youtube_url" text,
	"youtube_description" text,
	"thumbnail_s3_key" text,
	"thumbnail_prompt" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "songs" ADD COLUMN "bot_id" uuid;--> statement-breakpoint
ALTER TABLE "songs" ADD COLUMN "share_to" text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "song_videos" ADD CONSTRAINT "song_videos_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs" ADD CONSTRAINT "songs_bot_id_bots_id_fk" FOREIGN KEY ("bot_id") REFERENCES "public"."bots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "songs" DROP COLUMN "video_s3_key";