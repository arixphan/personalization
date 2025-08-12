import { UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'src/pipes/zod.pipe';
import { ZodSchema } from 'zod';

export const ValidateBody = (schema: ZodSchema) =>
  UsePipes(new ZodValidationPipe(schema));
