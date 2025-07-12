import { HttpException, HttpStatus } from '@nestjs/common';

export class UnauthorizedError extends HttpException {
  constructor() {
    super('Forbidden', HttpStatus.FORBIDDEN);
  }
}
