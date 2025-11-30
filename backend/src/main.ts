import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { JwtExpiredExceptionFilter } from './filters/jwt-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new JwtExpiredExceptionFilter());
  app.enableCors();
  app.use(cookieParser());
  // app.enableCors({
  //   origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  //   credentials: true, // Allow cookies to be sent
  // });

  const config = new DocumentBuilder()
    .setTitle('Personalization API')
    .setDescription('Personalization API description')
    .setVersion('1.0')
    .addTag('personalization')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
