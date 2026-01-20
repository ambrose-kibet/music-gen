import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../utils/types';
import { BotService } from './bot.service';
import { CreateBotDto } from './Dtos/create-bot.dto';
import { UpdateBotDto } from './Dtos/update-bot.dto';

import { BotOwnershipGuard } from './guards/bot-ownership.guard';
import { CheckOwnership } from '../utils/guard-helpers';
import { BotResponseDto, MyBotResponseDto } from './Dtos/bot-response.dto';

@ApiTags('bots')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthenticationGuard)
@Controller('bots')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post()
  @ApiBody({ type: CreateBotDto })
  @ApiResponse({
    status: 201,
    description: 'The bot has been created successfully.',
  })
  async createBot(
    @Body() createBotDto: CreateBotDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    const bot = await this.botService.createBot({
      data: createBotDto,
      userId: userId,
    });
    return bot;
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Retrieve all bots for the authenticated user.',
    type: [MyBotResponseDto],
  })
  async getUserBots(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    const bots = await this.botService.getUserBots(userId);
    return bots;
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'The bot has been retrieved successfully.',
    type: BotResponseDto,
  })
  @HttpCode(200)
  @UseGuards(BotOwnershipGuard)
  @CheckOwnership({ ownerField: 'userId', allowedRoles: ['ADMIN'] })
  async getBot(@Req() req: RequestWithUser) {
    const bot = req.resource;
    return bot;
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateBotDto })
  @ApiResponse({
    status: 200,
    description: 'The bot has been updated successfully.',
    type: MyBotResponseDto,
  })
  @HttpCode(200)
  @UseGuards(BotOwnershipGuard)
  @CheckOwnership({ ownerField: 'userId', allowedRoles: ['ADMIN'] })
  async updateBot(
    @Req() req: RequestWithUser,
    @Body() updateBotDto: UpdateBotDto,
  ) {
    const bot = req.resource;
    const updatedBot = await this.botService.updateBot({
      botId: bot.id,
      data: updateBotDto,
    });
    return updatedBot;
  }
}
