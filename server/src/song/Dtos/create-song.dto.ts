import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSongDto {
  @ApiProperty({
    example:
      '(verse 1)\nIn the stillness of the night,\nI hear a melody so bright...',
    description: 'lyrics of the song',
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  lyrics: string | undefined;

  @ApiProperty({
    example: true,
    description: 'whether the song is instrumental',
  })
  @IsOptional()
  instrumental: boolean;

  @ApiProperty({
    example: 'Country rock, upbeat tempo, guitar solo ',
    description: 'song prompt',
  })
  @IsString()
  @IsOptional()
  prompt: string | undefined;

  @ApiProperty({
    example: 'a song about the beauty of nature',
    description: 'fully described song prompt',
  })
  @IsString()
  @IsOptional()
  fullyDescribedSong: string | undefined;

  @ApiProperty({
    example: 'lyrics about nature with vivid descriptions',
    description: 'described lyrics of the song',
  })
  @IsString()
  @IsOptional()
  describedLyrics: string | undefined;

  @ApiProperty({
    example: 210,
    description: 'duration of the song in seconds',
  })
  @IsOptional()
  durationInSeconds?: number;

  @ApiProperty({
    example: ['facebook', 'youtube'],
    description: 'platforms to share the song to',
  })
  @IsOptional()
  @IsString({ each: true })
  shareTo: string[] | undefined;
}
