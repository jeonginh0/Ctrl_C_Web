import { UseGuards, Request, Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ChatRoomService } from './chatroom.service';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat-rooms')
export class ChatRoomController {
    constructor(private readonly chatRoomService: ChatRoomService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Request() req, @Body() dto: CreateChatRoomDto) {
        return this.chatRoomService.createChatRoom(req.user.userId, dto.title, dto.analysisId ?? undefined);
    }

    @UseGuards(JwtAuthGuard)
    @Get('user/:userId')
    async findByUser(@Param('userId') userId: string) {
        return this.chatRoomService.findByUser(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.chatRoomService.findById(id);
    }
}
