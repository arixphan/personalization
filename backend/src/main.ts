import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  // app.enableCors({
  //   origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  //   credentials: true, // Allow cookies to be sent
  // });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
