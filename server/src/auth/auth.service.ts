import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { UserService } from './user.service';
import { MailService } from '../mail/mail.service';
import { RegisterUserDto } from './Dtos/register-user.dto';
import { VerifyAccountDto } from './Dtos/verify-account.dto';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload, TokenPayload } from '../utils/types';
import { ConfigService } from '@nestjs/config';
import { Token } from 'nodemailer/lib/xoauth2';

@Injectable()
export class AuthService {
  constructor(
    private tokenService: TokenService,
    private userService: UserService,
    private mailService: MailService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(data: RegisterUserDto) {
    const existingUser = await this.userService.findUserByEmail(data.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const verificationCode = await this.tokenService.createVerificationCode(
      data.email,
    );

    const mailBody = this.mailService.populateVerificationEmailTemplate({
      name: data.name,
      code: verificationCode,
      type: 'verify',
    });
    await this.mailService.sendMail({
      to: data.email,
      subject: 'Verify your account',
      body: mailBody,
    });

    return {
      message:
        'Please check your email for verification token to verify your account',
    };
  }

  async verifyAccount(data: VerifyAccountDto) {
    const record = await this.tokenService.findCodeByEmailAndCode(
      data.email,
      data.code,
    );
    if (!record) {
      throw new BadRequestException('Invalid verification code');
    }
    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Verification code has expired');
    }

    // create the user
    const user = await this.userService.createUser({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    // delete the used token
    await this.tokenService.deleteCodeById(record.id);
    return user;
  }

  public async getUserFromAuthenticationToken(token: string) {
    try {
      const payload: AccessTokenPayload | TokenPayload = this.jwtService.verify(
        token,
        {
          secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        },
      );

      if (payload.hasOwnProperty('id') || payload.hasOwnProperty('userId')) {
        return payload;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async validateUser({ email, password }: { email: string; password: string }) {
    try {
      const user = await this.userService.findUserByEmail(email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const isPasswordValid = await this.userService.comparePassword(
        password,
        user.password || '',
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if (!user.emailConfirmed) {
        throw new UnauthorizedException('Email not confirmed');
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      return {
        message: 'Please check your email for password reset instructions',
      };
    }
    const resetToken = await this.tokenService.createPasswordResetToken(email);

    const mailBody = this.mailService.populateVerificationEmailTemplate({
      name: user.name,
      token: resetToken,
      type: 'reset',
    });
    await this.mailService.sendMail({
      to: email,
      subject: 'Reset your password',
      body: mailBody,
    });
    return {
      message: 'Please check your email for password reset instructions',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const email = await this.tokenService.verifyPasswordResetToken(token);
    const updateResult = await this.userService.updateUserPassword({
      email,
      newPassword,
    });
    if (!updateResult) {
      throw new BadRequestException('Failed to reset password');
    }
    await this.tokenService.deletePasswordResetTokenByEmail(email);
    return { message: 'Password reset successful' };
  }

  getCookieWithJwtAccessToken(user: AccessTokenPayload) {
    const payload = user;
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    });
    const cookie = `Authentication=${token}; HttpOnly; Path=/; Expires=${new Date(Date.now() + 1000 * 60 * 15)}; SameSite=None; Secure=false`;
    return cookie;
  }

  getCookieWithJwtRefreshToken(userId: string) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    });
    //you can also set the secure flag to true if you are using https
    // and the sameSite flag to 'None' if you are using cross-origin requests
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Expires=${new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)};SameSite=None; Secure=false`; // change secure to true if using https

    return {
      cookie,
      token,
    };
  }
  getLogOutCookies() {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure=true', // change secure to true if using https
      'Refresh=; HttpOnly; Path=/; Max-Age=0; SameSite=None; Secure=true', // change secure to true if using https
    ];
  }
}
