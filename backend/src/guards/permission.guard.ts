import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from 'src/decorators/permission.decorator';
import { UnauthorizedError } from 'src/exceptions/UnauthorizedError';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required, allow access
    }
    // Get user from request
    const request = context
      .switchToHttp()
      .getRequest<{ user: { permissions: string[] } }>();
    const user = request.user;

    if (!user || !user.permissions) {
      throw new UnauthorizedError();
    }

    // Check if user has at least one required role
    return requiredRoles.some((role) => user.permissions.includes(role));
  }
}
