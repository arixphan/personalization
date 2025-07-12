import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { USER_ROLE } from 'src/constants/user';
import { PasswordService } from 'src/modules/shared/password.service';

@Injectable()
export class UserService {
  constructor(
    readonly prismaService: PrismaService,
    private passwordService: PasswordService,
  ) {}

  private readonly logger = new Logger(UserService.name);

  private async checkIfEmailExists(username: string) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new HttpException(
        {
          status: HttpStatus.CONFLICT,
          error: `${username} already exists`,
        },
        HttpStatus.CONFLICT,
      );
    }
  }

  async register(registerUserDto: RegisterUserDto) {
    try {
      await this.checkIfEmailExists(registerUserDto.username);

      const hashedPassword = await this.passwordService.hashPassword(
        registerUserDto.password,
      );

      await this.prismaService.user.create({
        data: {
          username: registerUserDto.username,
          password: hashedPassword,
          roleId: USER_ROLE.USER,
        },
      });

      return {
        status: HttpStatus.CREATED,
        message: 'User registered successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to register user: ${error}`);

      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to register user',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findByUsername(username: string) {
    return this.prismaService.user.findUnique({
      where: { username },
    });
  }

  findAll() {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        roleId: true,
      },
    });
  }
}
