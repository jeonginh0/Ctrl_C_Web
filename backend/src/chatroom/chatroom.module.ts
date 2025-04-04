import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRoom, ChatRoomSchema } from './entity/chatroom.model';
import { ChatRoomService } from './chatroom.service';
import { ChatRoomController } from './chatroom.controller';
import { Analysis, AnalysisSchema } from '../analysis/entity/analysis.schema';
import { ConversationModule } from 'src/conversation/conversation.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ChatRoom.name, schema: ChatRoomSchema },
            { name: Analysis.name, schema: AnalysisSchema },
        ]),
        forwardRef(() => ConversationModule),
    ],
    controllers: [ChatRoomController],
    providers: [ChatRoomService],
    exports: [ChatRoomService, MongooseModule],
})
export class ChatRoomModule {}
