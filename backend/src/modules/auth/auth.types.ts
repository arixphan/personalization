import { User } from '@prisma/client';
import { JwtPayload } from './dto/jwt-payload';

export interface JwtTokenRequest extends Request {
  user: JwtPayload;
  logout: () => void; // Assuming this is a method to clear the session or token
  // You might need to adjust this based on your actual logout implementation
}

export interface LoginRequest extends Request {
  user: Omit<User, 'password'> & { permissions: string[] };
}
