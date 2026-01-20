import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { AuthUser, RequestWithUser } from '../../utils/types';
import JwtAuthenticationGuard from './jwt-auth.guard';

const RoleGuard = (...roles: AuthUser['role'][]): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    async canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;

      return user && roles.includes(user.role);
    }
  }

  return mixin(RoleGuardMixin);
};

export default RoleGuard;
