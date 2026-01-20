import {
  BadRequestException,
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
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import JwtAuthenticationGuard from '../auth/guards/jwt-auth.guard';
import { SongService } from './song.service';
import { UserSongsDto } from './Dtos/user-songs.dto';
import { CreateSongDto } from './Dtos/create-song.dto';
import type { RequestWithUser } from '../utils/types';
import { SongOwnershipGuard } from './guards/song-ownership.guard';
import { CheckOwnership } from '../utils/guard-helpers';
import { getPresignedUrl } from '../utils/aws-helpers';
import { DistributeSongDto } from './Dtos/distribute-song.dto';

@ApiTags('songs')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('songs')
@UseGuards(JwtAuthenticationGuard, SongOwnershipGuard)
export class SongController {
  constructor(private readonly songService: SongService) {}

  @Post()
  @ApiBody({ type: CreateSongDto })
  @ApiResponse({
    status: 201,
    description: 'The song has been created and queued for processing.',
  })
  async createSong(
    @Body() createSongDto: CreateSongDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.id;

    if (req.user.credits < 3) {
      throw new BadRequestException('Insufficient credits to create a song.');
    }

    const songId = await this.songService.createSong({
      data: createSongDto,
      userId: userId,
    });
    const queuedSongId = await this.songService.queueSongsForProcessing([
      songId.id,
    ]);
    return queuedSongId[0];
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'The song has been retrieved successfully.',
  })
  @HttpCode(200)
  @CheckOwnership({ ownerField: 'userId', allowedRoles: ['ADMIN'] })
  async getSong(@Req() req: RequestWithUser) {
    const song = req.resource;
    return this.songService.getSongWithVideo(song.id);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'List of songs retrieved successfully.',
  })
  @HttpCode(200)
  async getUserSongs(
    @Req() req: RequestWithUser,
    @Query() userSongsDto: UserSongsDto,
  ) {
    const userId = req.user.id;
    const songs = await this.songService.getSongsByUserId({
      userId,
      search: userSongsDto.search,
      page: userSongsDto.page || 1,
      limit: userSongsDto.limit || 10,
      orderBy: userSongsDto.orderBy,
      botId: userSongsDto.botId,
    });
    return songs;
  }

  @Get('signed-url/:id')
  @ApiParam({ name: 'id', type: 'string', description: 'Song ID' })
  @ApiResponse({
    status: 200,
    description: 'Get signed URL for song download.',
    type: String,
  })
  @HttpCode(200)
  @CheckOwnership({ ownerField: 'userId', allowedRoles: ['ADMIN'] })
  async getSignedUrl(@Req() req: RequestWithUser) {
    const song = req.resource;
    if (!song.audioS3Key) {
      throw new BadRequestException(`Song status is ${song.status}`);
    }
    const signedUrl = await getPresignedUrl(song.audioS3Key!);
    return signedUrl;
  }

  @Post('distribute/:id')
  @ApiParam({ name: 'id', type: 'string', description: 'Song ID' })
  @ApiResponse({
    status: 200,
    description: 'Song has been queued for distribution.',
  })
  @HttpCode(201)
  @CheckOwnership({ ownerField: 'userId', allowedRoles: ['ADMIN'] })
  async distributeSong(
    @Req() req: RequestWithUser,
    @Body() distributeSongDto: DistributeSongDto,
  ) {
    const song = req.resource;
    const result = await this.songService.distributeSong({
      songId: song.id,
      shareTo: distributeSongDto.shareTo,
    });

    return { message: 'Song has been queued for distribution successfully.' };
  }
}
