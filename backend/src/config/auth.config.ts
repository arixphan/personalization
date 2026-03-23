import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET,
  accessExpiration: Number(process.env.JWT_ACCESS_EXPIRATION_TIME || 1800),
  refreshExpiration: Number(process.env.JWT_REFRESH_EXPIRATION_TIME || 604800),
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  encryptionKey: process.env.ENCRYPTION_KEY,
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 12),
}));
