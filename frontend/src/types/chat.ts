export interface ChatRoom {
    _id: string;
    userId: string;
    assistantId: string;
    threadId: string | null;
    title: string;
    analysisId?: string;
    conversations: string[]; // ObjectId 배열
    createdAt: string;
    updatedAt: string;
}

export interface Conversation {
    _id: string;
    chatRoomId: string;
    userId: string;
    userResponse: string | null;
    gptResponse: string;
    userCreatedAt: string;
    gptCreatedAt: string;
} 