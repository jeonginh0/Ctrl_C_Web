import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './entity/conversation.model';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { AnalysisModule } from 'src/analysis/analysis.module';
import { ChatRoomModule } from 'src/chatroom/chatroom.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
    ]),
    AnalysisModule,
    forwardRef(() => ChatRoomModule),
  ],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],  
})
export class ConversationModule {}
