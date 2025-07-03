import { User } from '@prisma/client';
import { JwtPayload } from './dto/jwt-payload';

export interface JwtTokenRequest extends Request {
  user: JwtPayload;
}

export interface LoginRequest extends Request {
  user: Omit<User, 'password'> & { permissions: string[] };
}
