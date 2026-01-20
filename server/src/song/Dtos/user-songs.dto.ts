import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UserSongsDto {
  @ApiProperty({
    example: 'love',
    description: 'search term to filter songs by title or prompt',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    example: 1,
    description: 'page number for pagination',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number;

  @ApiProperty({
    example: 10,
    description: 'number of songs to return per page',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number;

  @ApiProperty({
    example: 'date desc',
    description:
      "order by clause to sort songs. Options: 'date asc', 'date desc', 'title asc', 'title desc'",
    required: false,
  })
  @IsOptional()
  @IsString()
  orderBy?: 'date asc' | 'date desc' | 'title asc' | 'title desc';

  //botId filter
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'filter songs by bot ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  botId?: string;
}
