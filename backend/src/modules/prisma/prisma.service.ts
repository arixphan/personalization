// prisma.service.ts (in NestJS)
import { PrismaClient } from '@prisma/client';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
      ],
    });

    // Logging middleware using client extension
    this.$extends({
      query: {
        $allOperations({ operation, model, args, query }) {
          console.log(`Before: ${model}.${operation}`);
          const result = query(args);
          console.log(`After: ${model}.${operation}`);
          return result;
        },
      },
    });
  }
}
