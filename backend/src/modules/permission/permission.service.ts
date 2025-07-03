import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class PermissionService {
  constructor(private readonly prismaService: PrismaService) {}
  async getPermissionsByRoleId(roleId: number): Promise<string[]> {
    const permissions = await this.prismaService.permission.findMany({
      where: {
        roles: {
          some: {
            id: roleId,
          },
        },
      },
    });

    return permissions.map((permission) => permission.name);
  }
}
