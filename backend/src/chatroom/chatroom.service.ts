import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatRoom } from './entity/chatroom.model';
import { Conversation } from '../conversation/entity/conversation.model';
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

    async createChatRoom(userId: string, analysisId?: string) {
        const thread = await this.openai.beta.threads.create();
    
        const today = new Date();
        const title = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 상담`;
    
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

    async findAllChatRooms(userId: string, page: number = 1, limit: number = 5) {
        const skip = (page - 1) * limit;
    
        const chatRooms = await this.chatRoomModel
            .find({ userId })
            .populate('conversations');
    
        const chatRoomsInfo = chatRooms.map((room) => {
            const conversations = room.conversations as any[];
            const lastConv = conversations[conversations.length - 1];
            const firstConv = conversations[0];
    
            let consultationDateObj: Date | null = null;
            let consultationDate: string | null = null;
    
            const rawDate = lastConv?.userCreatedAt
                ? lastConv.gptCreatedAt
                : firstConv?.gptCreatedAt;
    
            if (rawDate) {
                const d = new Date(rawDate);
                consultationDateObj = d;
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                consultationDate = `${yyyy}/${mm}/${dd}`;
            }
    
            return {
                _id: room._id,
                title: room.title,
                consultationDate,
                consultationDateObj,
            };
        });
    
        const sortedRooms = chatRoomsInfo.sort((a, b) => {
            if (!a.consultationDateObj) return 1;
            if (!b.consultationDateObj) return -1;
            return b.consultationDateObj.getTime() - a.consultationDateObj.getTime();
        });
    
        const paginatedRooms = sortedRooms.slice(skip, skip + limit);
    
        return {
            page,
            totalPages: Math.ceil(chatRoomsInfo.length / limit),
            totalChatRooms: chatRoomsInfo.length,
            chatRooms: paginatedRooms.map(({ consultationDateObj, ...rest }) => rest),
        };
    }

    async deleteChatRoom(userId: string, chatRoomId: string) {
        const chatRoom = await this.chatRoomModel.findById(chatRoomId);
    
        if (!chatRoom) {
            throw new NotFoundException('채팅방을 찾을 수 없습니다.');
        }
    
        if (chatRoom.userId.toString() !== userId.toString()) {
            throw new ForbiddenException('해당 채팅방을 삭제할 권한이 없습니다.');
        }
    
        await this.chatRoomModel.findByIdAndDelete(chatRoomId);
        return { message: '채팅방이 성공적으로 삭제되었습니다.' };
    }
        
    async findByUser(userId: string) {
        return this.chatRoomModel.find({ userId }).populate('conversations');
    }

    async findById(id: string) {
        return this.chatRoomModel.findById(id).populate('conversations');
    }
}
