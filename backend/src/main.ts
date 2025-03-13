import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS 설정
  app.enableCors({
    origin: 'http://localhost:3001',  // 프론트엔드 서버의 URL (예시: React 앱이 3001 포트에서 실행될 경우)
    methods: 'GET, POST, PUT, DELETE',  // 허용할 HTTP 메소드
    allowedHeaders: 'Content-Type, Authorization',  // 허용할 헤더
  });

  // HTTP 서버 실행
  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    Logger.log(`Server is running on http://localhost:${port}`);
  });
}

bootstrap();
