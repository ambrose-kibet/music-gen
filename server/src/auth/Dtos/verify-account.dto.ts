import { RegisterUserDto } from './register-user.dto';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyAccountDto extends RegisterUserDto {
  @ApiProperty({
    example: '123456',
    description: 'The verification token sent to the user email',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  code: string;
}
