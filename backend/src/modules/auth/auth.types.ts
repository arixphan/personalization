import { User } from '@prisma/client';
import { JwtPayload } from '@personalization/shared';

export interface JwtTokenRequest extends Request {
  user: JwtPayload;
  logout: () => void;
}

export interface LoginRequest extends Request {
  user: Omit<User, 'password'> & { permissions: string[] };
}
