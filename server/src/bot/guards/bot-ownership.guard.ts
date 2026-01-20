import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import { BotService } from '../bot.service';
import { OwnershipMeta, RequestWithUser } from '../../utils/types';
import { Reflector } from '@nestjs/core';
import { OWNERSHIP_METADATA_KEY } from '../../utils/guard-helpers';

@Injectable()
export class BotOwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly botService: BotService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: RequestWithUser = context.switchToHttp().getRequest();
    const userId = req.user.id;
    const botId = req.params.id;
    const meta = this.reflector.get<OwnershipMeta>(
      OWNERSHIP_METADATA_KEY,
      context.getHandler(),
    );

    if (!meta) return true;

    const bot = await this.botService.getBotById(botId);
    if (!bot) {
      throw new NotFoundException('Bot not found');
    }

    const ownerField = meta.ownerField ?? 'userId';
    const allowedRoles = meta.allowedRoles ?? [];

    const isOwner = bot[ownerField] === userId;
    const hasRole = allowedRoles.includes(req.user.role);

    if (!isOwner && !hasRole) {
      throw new ForbiddenException();
    }

    req.resource = bot;

    return true;
  }
}
