import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface Message {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    isRead: boolean;
}

export interface ChatRoom {
    id: string;
    userId: string;
    analysisId?: string;
    conversations: Message[];
    createdAt: string;
    updatedAt: string;
}

export const chatService = {
    // 채팅방 생성
    createChatRoom: async (analysisId?: string) => {
        const response = await axios.post(`${API_BASE_URL}/chat-rooms/${analysisId || ''}`);
        return response.data;
    },

    // 채팅방의 대화 내역 조회
    getConversations: async (chatRoomId: string) => {
        const response = await axios.get(`${API_BASE_URL}/chat-rooms/${chatRoomId}/conversations`);
        return response.data;
    },

    // 사용자의 채팅방 목록 조회
    getChatRooms: async (userId: string) => {
        const response = await axios.get(`${API_BASE_URL}/chat-rooms/user/${userId}`);
        return response.data;
    },

    // 특정 채팅방 조회
    getChatRoom: async (chatRoomId: string) => {
        const response = await axios.get(`${API_BASE_URL}/chat-rooms/${chatRoomId}`);
        return response.data;
    },

    // 메시지 전송
    sendMessage: async (chatRoomId: string, content: string) => {
        const response = await axios.post(`${API_BASE_URL}/conversations/send/${chatRoomId}`, {
            userResponse: content
        });
        return response.data;
    },

    // 대화 내역 조회
    getHistory: async (chatRoomId: string) => {
        const response = await axios.get(`${API_BASE_URL}/conversations/history/${chatRoomId}`);
        return response.data;
    },

    // 마지막 답변 재생성
    regenerateLastAnswer: async (chatRoomId: string, userId: string) => {
        const response = await axios.post(`${API_BASE_URL}/conversations/regenerate/${chatRoomId}`, {
            userId
        });
        return response.data;
    }
}; 