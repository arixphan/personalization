// prisma.service.ts (in NestJS)
import { Prisma, PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super();
    this.$use(loggingMiddleware); // register middleware
  }
}

export const loggingMiddleware: Prisma.Middleware = async (params, next) => {
  console.log(`Before: ${params.model}.${params.action}`);

  const result = await next(params);

  console.log(`After: ${params.model}.${params.action}`);
  return result;
};
