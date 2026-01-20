import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PasswordResetDto {
  @ApiProperty({
    example: '27527GF*asd',
    description: 'The new password for the user',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example:
      'yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFtYnJvc2VraWJldDU3NkBnbWFpbC5jb20iLCJpYXQiOjE2OTYyNzI0MDAsImV4cCI6MTY5NjI3NjAwMH0.DXK1bX1n5pX8FJH8Qz8nXfN4xQz8nXfN4xQz8nXfN4xQz8nXfN4xQz8nXfN4x',
    description: 'The token for the password reset sent to the user email',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
