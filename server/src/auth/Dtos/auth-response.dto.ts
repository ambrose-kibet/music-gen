import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: '1',
    description: 'The id of the user',
  })
  id: string;

  @Exclude()
  @ApiProperty({
    example: 'johndoe@mail.com',
    description: 'The email of the user',
  })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user',
  })
  name: string;

  @ApiProperty({
    example: 'USER',
    description: 'The role of the user(ADMIN, USER)',
  })
  role: string;

  @ApiProperty({
    example: 'https://www.example.com/avatar.jpg',
    description: 'The avatar url of the user',
  })
  avatar: string;

  @ApiProperty({
    example: 5,
    description: 'The number of credits the user has',
  })
  credits: number;

  @Exclude()
  refreshToken: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  emailConfirmed: boolean;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  password: string;
}
