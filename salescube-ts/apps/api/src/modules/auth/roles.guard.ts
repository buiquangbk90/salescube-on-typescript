import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthUser } from '@salescube/shared';
import { PERMISSIONS_KEY, ROLES_KEY } from './decorators';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles?.length && !requiredPermissions?.length) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as AuthUser | undefined;
    if (!user) throw new ForbiddenException('Not authenticated');

    if (requiredRoles?.length) {
      const has = requiredRoles.some((r) => user.roles.includes(r));
      if (!has) throw new ForbiddenException('Thiếu role yêu cầu');
    }

    if (requiredPermissions?.length) {
      const userPermissions = (user as any).permissions || [];
      const has = requiredPermissions.every((p) => userPermissions.includes(p));
      if (!has) throw new ForbiddenException('Thiếu permission yêu cầu');
    }

    return true;
  }
}
