import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required, allow access
    }

    // Get user from request
    const request = context
      .switchToHttp()
      .getRequest<{ user: { roles: string[] } }>();
    const user = request.user;

    if (!user || !user.roles) {
      return false; // No user or roles, deny access
    }

    // Check if user has at least one required role
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
