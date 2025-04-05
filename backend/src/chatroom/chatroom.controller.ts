import { UseGuards, Req, Controller, Post, Body, Get, Param, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ChatRoomService } from './chatroom.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('chat-rooms')
export class ChatRoomController {
    constructor(private readonly chatRoomService: ChatRoomService) {}

    @Post(':analysisId')
    async create(@Req() req, @Param('analysisId') analysisId?: string) {
        const userId = req.user.userId;
        return this.chatRoomService.createChatRoom(userId, analysisId);
    }

    @Get(':chatRoomId/conversations')
    async getConversations(@Param('chatRoomId') chatRoomId: string, @Req() req) {
        const chatRoom = await this.chatRoomService.findById(chatRoomId);
    
        if (!chatRoom) {
            throw new NotFoundException('Chat room not found');
        }
    
        if (chatRoom.userId.toString() !== req.user.userId.toString()) {
            throw new UnauthorizedException('Unauthorized access');
        }
    
        return chatRoom.conversations;
    }

    @Get('user/:userId')
    async findByUser(@Param('userId') userId: string) {
        return this.chatRoomService.findByUser(userId);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.chatRoomService.findById(id);
    }
}
