import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { SongService } from '../song.service';
import { OwnershipMeta, RequestWithUser } from '../../utils/types';
import { Reflector } from '@nestjs/core';
import { OWNERSHIP_METADATA_KEY } from '../../utils/guard-helpers';

@Injectable()
export class SongOwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly songSService: SongService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: RequestWithUser = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const songId = req.params.id;
    const meta = this.reflector.get<OwnershipMeta>(
      OWNERSHIP_METADATA_KEY,
      context.getHandler(),
    );

    if (!meta) return true;

    const song = await this.songSService.getSongById(songId);
    if (!song) {
      throw new NotFoundException('Song not found');
    }

    const ownerField = meta.ownerField ?? 'userId';
    const allowedRoles = meta.allowedRoles ?? [];

    const isOwner = song[ownerField] === req.user.id;
    const hasRole = allowedRoles.includes(req.user.role);

    if (!isOwner && !hasRole) {
      throw new ForbiddenException();
    }

    req.resource = song;

    return true;
  }
}
