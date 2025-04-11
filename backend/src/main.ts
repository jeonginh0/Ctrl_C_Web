import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 바디 파서 설정
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // 서버 시작
  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    Logger.log(`🚀 Server is running on http://localhost:${port}`);
  });
}

bootstrap();
