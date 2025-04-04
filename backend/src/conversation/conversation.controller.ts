import { UseGuards, Request, Controller, Post, Body, Param, Get } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { AskQuestionDto } from './dto/ask-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('conversations')
export class ConversationController {
    constructor(private readonly conversationService: ConversationService) {}

    // 메시지 전송
    @UseGuards(JwtAuthGuard)
    @Post('send/:chatRoomId')
    async sendMessage(@Request() req, @Param('chatRoomId') chatRoomId: string, @Body() dto: AskQuestionDto) {
        return this.conversationService.sendMessage(req.user.userId, chatRoomId, dto.userResponse);
    }

    // 대화 내역 조회
    @UseGuards(JwtAuthGuard)
    @Get('history/:chatRoomId')
    async getConversations(@Param('chatRoomId') chatRoomId: string) {
        return this.conversationService.getConversations(chatRoomId);
    }

    // 마지막 답변 재생성
    @UseGuards(JwtAuthGuard)
    @Post('regenerate/:chatRoomId')
    async regenerateLastAnswer(
        @Param('chatRoomId') chatRoomId: string,
        @Body() dto: { userId: string }
    ) {
        return this.conversationService.regenerateLastAnswer(chatRoomId, dto.userId);
    }
}
