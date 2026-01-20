import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class DistributeSongDto {
  @ApiProperty({
    example: ['facebook', 'youtube'],
    description:
      "Platforms to distribute the song to. Options: 'facebook', 'youtube', 'audius', 'whatsapp'",
    required: true,
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsString({ each: true })
  shareTo: ('facebook' | 'youtube' | 'audius' | 'whatsapp')[];
}
