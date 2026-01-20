import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class BotResponseDto {
  @ApiProperty({
    example: '1',
    description: 'The id of the bot',
  })
  id: string;

  @ApiProperty({
    example: 'My Awesome Bot',
    description: 'The name of the bot',
  })
  name: string;

  @ApiProperty({
    example: 'This bot generates awesome pop music tracks.',
    description: 'The description of the bot',
  })
  description: string;

  @ApiProperty({
    example:
      '[{"prompt":"jazz, saxophone, jazz, saxophone, jazz, relaxing","shareTo":["whatsapp","youtube","audius","facebook"]},{"prompt":"jazz, saxophone, jazz, saxophone, jazz, relaxing","shareTo":[]}]',
    description: 'The stringified requests of the bot',
  })
  requests: string;

  @ApiProperty({
    example: ['monday', 'wednesday', 'friday'],
    description: 'The frequency of bot activity',
    type: [String],
  })
  frequency: string[];

  @ApiProperty({
    example: true,
    description: 'Indicates if the bot is active',
  })
  isActive: boolean;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'The creation date of the bot',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-02T00:00:00.000Z',
    description: 'The last update date of the bot',
  })
  updatedAt: Date;

  @Exclude()
  userId: string;
}

export class MyBotResponseDto {
  @ApiProperty({
    example: '1',
    description: 'The id of the bot',
  })
  id: string;

  @ApiProperty({
    example: 'My Awesome Bot',
    description: 'The name of the bot',
  })
  name: string;

  @ApiProperty({
    example: 'This bot generates awesome pop music tracks.',
    description: 'The description of the bot',
  })
  description: string;

  @ApiProperty({
    example: true,
    description: 'Indicates if the bot is active',
  })
  isActive: boolean;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'The creation date of the bot',
  })
  createdAt: Date;
}
