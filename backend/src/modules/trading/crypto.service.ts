import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly logger = new Logger(CryptoService.name);

  constructor() {
    const secret =
      process.env.ENCRYPTION_KEY || 'default_secret_key_needs_32_bytes!';
    // Ensure key is exactly 32 bytes for aes-256-cbc
    this.key = crypto.createHash('sha256').update(String(secret)).digest();
  }

  encrypt(text: string): string | null {
    if (!text) return null;
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      this.logger.error('Encryption failed', error);
      throw new Error('Encryption failed');
    }
  }

  decrypt(text: string): string | null {
    if (!text) return null;
    try {
      const parts = text.split(':');
      const iv = Buffer.from(parts.shift() || '', 'hex');
      const encryptedText = parts.join(':');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      this.logger.error('Decryption failed', error);
      throw new Error('Decryption failed');
    }
  }
}
