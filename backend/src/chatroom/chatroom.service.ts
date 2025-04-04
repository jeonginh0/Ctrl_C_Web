import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatRoom } from './entity/chatroom.model';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { ConversationService } from '../conversation/conversation.service';
import OpenAI from 'openai';

@Injectable()
export class ChatRoomService {
    private openai: OpenAI;

    constructor(
        @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
        private readonly conversationService: ConversationService,
    ) {
        this.openai = new OpenAI({ apiKey: process.env.GPT_API_KEY });
    }

    async createChatRoom(userId: string, title: string, analysisId?: string) {
        const thread = await this.openai.beta.threads.create();
        
        const chatRoom = new this.chatRoomModel({
            userId,
            title,
            assistantId: process.env.OPENAI_ASSISTANT_ID,
            analysisId: analysisId ?? null,
            threadId: thread.id,
            conversations: [],
        });
    
        await chatRoom.save();
    
        const chatRoomId = (chatRoom._id as Types.ObjectId).toString();
        await this.conversationService.sendInitialMessage(userId, chatRoomId, analysisId ?? null, thread.id);
    
        return chatRoom;
    }


    async findByUser(userId: string) {
        return this.chatRoomModel.find({ userId }).populate('conversations');
    }

    async findById(id: string) {
        return this.chatRoomModel.findById(id).populate('conversations');
    }

}
