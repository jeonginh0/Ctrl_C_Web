import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MulterModule } from '@nestjs/platform-express';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { OcrModule } from './ocr/ocr.module';
import { AnalysisModule } from './analysis/analysis.module';
import { ChatRoomModule } from './chatroom/chatroom.module';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI as string),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    OcrModule,
    AnalysisModule,
    ChatRoomModule,
    ConversationModule,
  ],
})
export class AppModule {}