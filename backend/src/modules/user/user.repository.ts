import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';

export interface CreateOAuthUserData {
  username: string;
  googleId?: string;
  name?: string;
  avatar?: string;
  roleId: number;
  email?: string;
}

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({
      where: { googleId },
      include: { userProfile: true },
    });
  }

  async findByEmail(email: string) {
    const profile = await this.prisma.userProfile.findUnique({
      where: { email },
      include: { user: true },
    });
    return profile?.user ?? null;
  }

  async updateGoogleId(userId: number, googleId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { googleId },
    });
  }

  async createOAuthUser(data: CreateOAuthUserData) {
    return this.prisma.user.create({
      data: {
        username: data.username,
        googleId: data.googleId,
        name: data.name,
        avatar: data.avatar,
        roleId: data.roleId,
        ...(data.email && {
          userProfile: {
            create: { email: data.email, name: data.name, avatar: data.avatar },
          },
        }),
      },
      include: { userProfile: true },
    });
  }

  async create(data: any) {
    return this.prisma.user.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        roleId: true,
      },
    });
  }
}
