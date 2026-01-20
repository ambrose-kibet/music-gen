import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBotDto {
  @ApiProperty({
    description: 'Name of the bot',
    example: 'My Awesome Bot',
  })
  @MinLength(3)
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the bot',
    example: 'This bot generates awesome pop music tracks.',
    required: false,
  })
  @MaxLength(200)
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description:
      'A stringified request prompts  and share to details for the bot',
    example:
      '[{"prompt":"jazz, saxophone, jazz, saxophone, jazz, relaxing","shareTo":["whatsapp","youtube","audius","facebook"]},{"prompt":"jazz, saxophone, jazz, saxophone, jazz, relaxing","shareTo":[]}]',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  requests: string;

  @ApiProperty({
    description: 'Frequency of bot activity (e.g., days of the week)',
    example: ['monday', 'wednesday', 'friday'],
    type: [String],
  })
  @IsNotEmpty({ each: true })
  frequency: string[];

  @ApiProperty({
    description: 'Indicates if the bot is active',
    example: true,
  })
  @IsNotEmpty()
  isActive: boolean;
}
