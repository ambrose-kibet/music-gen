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
import JwtAuthenticationGuard from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../utils/types';
import { IntegrationService } from './integration.service';
import { AudiusService } from './audius/audius.service';
import { AudiusIntegrationDto } from './dtos/audius-intergration.dto';
import { YoutubeService } from './youtube/youtube.service';
import type { Response } from 'express';
import { FacebookService } from './facebook/facebook.service';

@Controller('integrations')
export class IntegrationController {
  constructor(
    private integrationService: IntegrationService,
    private audiusService: AudiusService,
    private youtubeService: YoutubeService,
    private facebookService: FacebookService,
  ) {}

  @Post('audius')
  @UseGuards(JwtAuthenticationGuard)
  async upsertAudiusCredentials(
    @Req() req: RequestWithUser,
    @Body() body: AudiusIntegrationDto,
  ) {
    const resp = await this.audiusService.upsertAudiusCredentials({
      userId: req.user.id,
      audiusUserId: body.audiusUserId,
    });
    return { message: 'Audius credentials saved successfully', data: resp.id };
  }

  @Get('youtube')
  @UseGuards(JwtAuthenticationGuard)
  async initiateYoutubeOAuth(@Req() req: RequestWithUser) {
    const url = this.youtubeService.initiateOAuthFlow(req.user.id);
    return { url };
  }

  @Get('youtube/callback')
  @HttpCode(200)
  async handleYoutubeOAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const accessToken = await this.youtubeService.getAccessToken({
        code,
        state,
      });
      // Redirect to client with success message
      return res.redirect(
        `${process.env.CLIENT_URL}/integrations/?service=youtube&status=success`,
      );
    } catch (error) {
      // Redirect to client with error message
      return res.redirect(
        `${process.env.CLIENT_URL}/integrations/?service=youtube&status=error`,
      );
    }
  }

  @Get('facebook')
  @UseGuards(JwtAuthenticationGuard)
  async initiateFacebookOAuth(@Req() req: RequestWithUser) {
    const url = this.facebookService.initiateOAuthFlow(req.user.id);
    return { url };
  }

  @Get('facebook/callback')
  @HttpCode(200)
  async handleFacebookOAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const accessToken = await this.facebookService.getAccessToken({
        code,
        state,
      });
      // Redirect to client with success message
      return res.redirect(
        `${process.env.CLIENT_URL}/integrations/?service=facebook&status=success`,
      );
    } catch (error) {
      // Redirect to client with error message
      return res.redirect(
        `${process.env.CLIENT_URL}/integrations/?service=facebook&status=error`,
      );
    }
  }
}
