import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정
  app.enableCors();

  // HTTP 서버 실행
  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    Logger.log(`Server is running on http://localhost:${port}`);
  });
}

bootstrap();
