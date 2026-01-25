import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { RegisterUserDto } from './Dtos/register-user.dto';
import { AuthService } from './auth.service';
import { VerifyAccountDto } from './Dtos/verify-account.dto';
import type { RequestWithUser } from '../utils/types';
import { LocalAuthenticationGuard } from './guards/local-auth.guard';
import { LogInDto } from './Dtos/login.dto';
import JwtRefreshGuard from './guards/jwt-refresh.guard';
import { AuthResponseDto } from './Dtos/auth-response.dto';
import { SerializeData } from '../utils/interceptors/transfrom-data.interceptor';
import { ForgotPasswordDto } from './Dtos/forgot-password.dto';
import { PasswordResetDto } from './Dtos/pasword-reset.dto';
import JwtAuthenticationGuard from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiResponse({
    status: 201,
    description:
      'Please check your email for verification token to verify your account',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: RegisterUserDto })
  @HttpCode(201)
  async register(@Body() registrationData: RegisterUserDto) {
    return this.authService.register(registrationData);
  }

  @Post('verify')
  @ApiResponse({
    status: 200,
    description: 'Account verified successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @SerializeData(AuthResponseDto)
  @ApiBody({ type: VerifyAccountDto })
  @HttpCode(200)
  async verifyAccount(
    @Body() verificationData: VerifyAccountDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.verifyAccount(verificationData);
    const cookie = this.authService.getCookieWithJwtAccessToken(user);
    const refreshCookie = this.authService.getCookieWithJwtRefreshToken(
      user.id,
    );
    await this.userService.setCurrentRefreshToken(refreshCookie.token, user.id);
    res.setHeader('Set-Cookie', [cookie, refreshCookie.cookie]);
    return user;
  }

  @Post('login')
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LogInDto })
  @HttpCode(200)
  @SerializeData(AuthResponseDto)
  @UseGuards(LocalAuthenticationGuard)
  async login(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user } = request;
    const accessToken = this.authService.getCookieWithJwtAccessToken(user);
    const refreshToken = this.authService.getCookieWithJwtRefreshToken(user.id);
    await this.userService.setCurrentRefreshToken(refreshToken.token, user.id);
    res.setHeader('Set-Cookie', [accessToken, refreshToken.cookie]);
    return user;
  }

  @Get('refresh')
  @SerializeData(AuthResponseDto)
  @ApiResponse({
    status: 200,
    description: 'Access token refreshed successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(200)
  @UseGuards(JwtRefreshGuard)
  refresh(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(
      request.user,
    );
    res.setHeader('Set-Cookie', accessTokenCookie);
    return request.user;
  }

  @Post('forgot-password')
  @ApiResponse({ status: 201, description: 'Password reset email sent' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @HttpCode(201)
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return await this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @HttpCode(200)
  @ApiBody({ type: PasswordResetDto })
  async resetPassword(@Body() body: PasswordResetDto) {
    return await this.authService.resetPassword(body.token, body.password);
  }

  @Delete('logout')
  @ApiResponse({ status: 200, description: 'Log out successful' })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  async logOut(
    @Req() request: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.userService.removeRefreshToken(request.user.id);
    const cookies = this.authService.getLogOutCookies();
    res.setHeader('Set-Cookie', cookies);
    return 'Log out successful';
  }

  @Get('me')
  @ApiResponse({ status: 200, description: 'Get current user info' })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  @HttpCode(200)
  @UseGuards(JwtAuthenticationGuard)
  @SerializeData(AuthResponseDto)
  async getCurrentUser(@Req() request: RequestWithUser) {
    return request.user;
  }

  @Get('health')
  @HttpCode(200)
  async healthCheck() {
    let time = new Date().toISOString();
    return { status: 'OK', time };
  }
}
