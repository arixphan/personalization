import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  constructor(private readonly configService: ConfigService) {}

  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS');
    if (!saltRounds) {
      throw new Error(
        'BCRYPT_SALT_ROUNDS is not defined in the environment variables',
      );
    }
    const salt = await bcrypt.genSalt(+saltRounds);
    return await bcrypt.hash(password, salt);
  }
}
