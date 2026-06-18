import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: config.get<string>('API_CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  const port = config.get<number>('API_PORT', 3001);
  await app.listen(port);
  logger.log(`SalesCube API listening on http://localhost:${port}`);
}

bootstrap();
