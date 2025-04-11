import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const clientBuildPath = join(__dirname, '..', '..', '..', 'frontend', 'out');
  const expressApp = app.getHttpAdapter().getInstance();

  // 정적 파일 서빙
  expressApp.use(express.static(clientBuildPath));

  // ✅ [중요] chatroom 동적 라우팅을 export된 HTML로 직접 대응
  expressApp.get('/chatroom/:id', (req, res) => {
    const id = req.params.id;
    const filePath = join(clientBuildPath, 'chatroom', id, 'index.html');
    res.sendFile(filePath);
  });

  // ✅ 기타 모든 SPA 라우트는 index.html로 fallback
  expressApp.get('/analysis/:id', (req, res) => {
    const id = req.params.id;
    res.sendFile(join(clientBuildPath, 'analysis', id, 'index.html'));
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    Logger.log(`Server is running on http://localhost:${port}`);
  });
}

bootstrap();