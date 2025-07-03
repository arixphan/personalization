import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PermissionService } from 'src/modules/permission/permission.service';
import { PasswordService } from 'src/modules/shared/password.service';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly permissionService: PermissionService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<(Omit<User, 'password'> & { permissions: string[] }) | null> {
    const user = await this.userService.findByUsername(username);
    const isPass = await this.passwordService.comparePasswords(
      password,
      user?.password || '',
    );
    if (user && isPass) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      const permissions = await this.permissionService.getPermissionsByRoleId(
        user.roleId,
      );
      return { ...result, permissions: permissions || [] };
    }
    return null;
  }

  login(user: Omit<User, 'password'> & { permissions: string[] }) {
    const payload = {
      username: user.username,
      sub: user.id,
      roleId: user.roleId,
      permissions: user.permissions,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
