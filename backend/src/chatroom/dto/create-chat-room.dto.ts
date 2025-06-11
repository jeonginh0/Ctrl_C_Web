export class CreateChatRoomDto {
    userId: string;
    assistantId: string;
    title: string;
    analysisId?: string | null;
}