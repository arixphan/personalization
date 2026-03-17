import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RegisterUserDto } from '@personalization/shared';
import { USER_ROLE } from '@personalization/shared';
import { PasswordService } from 'src/modules/shared/password.service';
import { CreateOAuthUserData, UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  private readonly logger = new Logger(UserService.name);

  private async checkIfEmailExists(username: string) {
    const existingUser = await this.userRepository.findByUsername(username);

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

      await this.userRepository.create({
        username: registerUserDto.username,
        password: hashedPassword,
        roleId: USER_ROLE.USER,
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

  async getProfile(userId: number) {
    return this.userRepository.getProfile(userId);
  }

  async updateProfile(userId: number, data: any) {
    return this.userRepository.updateProfile(userId, data);
  }

  findByUsername(username: string) {
    return this.userRepository.findByUsername(username);
  }

  findByGoogleId(googleId: string) {
    return this.userRepository.findByGoogleId(googleId);
  }

  findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  createOAuthUser(data: CreateOAuthUserData) {
    return this.userRepository.createOAuthUser(data);
  }

  findAll() {
    return this.userRepository.findAll();
  }
}
