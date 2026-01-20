import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AudiusIntegrationDto {
  @ApiProperty({
    example: '123456789',
    description: 'The Audius user ID to integrate with',
  })
  @IsString()
  @IsNotEmpty()
  audiusUserId: string;
}
