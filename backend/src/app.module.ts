import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { OcrModule } from './ocr/ocr.module';
import { OcrService } from './ocr/ocr.service';
import { OcrResult, OcrResultSchema } from './ocr/entity/ocr-result.schema';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'out'),
      serveRoot: '/',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'out', '_next'),
      serveRoot: '/_next/',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // 업로드된 파일이 저장될 폴더 경로
      serveRoot: '/uploads', // 클라이언트에서 접근할 수 있는 경로
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MulterModule.register({
      dest: join(__dirname, '..', 'uploads'), // 절대 경로로 설정
    }),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    MongooseModule.forFeature([{ name: OcrResult.name, schema: OcrResultSchema }]),
    AuthModule,
    OcrModule
  ],
  providers: [OcrService],
  exports: [OcrService],
})
export class AppModule {}
