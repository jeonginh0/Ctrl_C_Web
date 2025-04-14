import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { User, UserSchema } from './entity/user.schema';
import { ChatRoom, ChatRoomSchema } from '../chatroom/entity/chatroom.model';
import { Conversation, ConversationSchema } from '../conversation/entity/conversation.model';
import { OcrResult, OcrResultSchema } from '../ocr/entity/ocr-result.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ChatRoom.name, schema: ChatRoomSchema },
      { name: Conversation.name, schema: ConversationSchema },
      { name: OcrResult.name, schema: OcrResultSchema },
    ]),

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret',  // .env 파일에서 secret 값이 없을 경우 기본값 사용
      signOptions: { expiresIn: '1h' },
    }),

    ConfigModule.forRoot({
      isGlobal: true,  // ConfigModule을 전역으로 사용 가능하도록 설정
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
