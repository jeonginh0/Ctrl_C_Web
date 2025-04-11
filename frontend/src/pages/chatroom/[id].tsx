import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ApiClient from '@/ApiClient';
import type { ChatRoom as ChatRoomType, Conversation } from '@/types/chat';
import ConversationSection from '@/components/containers/Chatroom/ConversationSection';
import styles from '@/styles/ChatRoom.module.css';
import { FiArrowLeft } from 'react-icons/fi';

interface Message {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    isRead: boolean;
}

const convertConversationToMessage = (conversation: Conversation, userId: string): Message[] => {
    const messages: Message[] = [];
    
    if (conversation.userResponse) {
        messages.push({
            id: conversation._id + '_user',
            sender: userId,
            content: conversation.userResponse,
            timestamp: conversation.userCreatedAt,
            isRead: true
        });
    }
    
    messages.push({
        id: conversation._id + '_gpt',
        sender: 'gpt',
        content: conversation.gptResponse,
        timestamp: conversation.gptCreatedAt,
        isRead: true
    });
    
    return messages;
};

const ChatRoom = () => {
    const router = useRouter();
    const { id } = router.query;
    const [token, setToken] = useState<string | null>(null);
    const [chatRoom, setChatRoom] = useState<ChatRoomType | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            setToken(token);
        }
    }, []);

    useEffect(() => {
        console.log('Router query id:', id);
        const fetchChatRoom = async () => {
            if (!id || !token) {
                console.log('No id or token:', { id, token });
                setLoading(false);
                return;
            }

            try {
                console.log('Fetching chat room with id:', id);
                const [chatRoomResponse, conversationsResponse] = await Promise.all([
                    ApiClient.get(`/chat-rooms/${id}/show`),
                    ApiClient.get(`/chat-rooms/${id}/conversations`)
                ]);
                console.log('Chat room response:', chatRoomResponse.data);
                console.log('Conversations response:', conversationsResponse.data);
                setChatRoom(chatRoomResponse.data);
                setConversations(conversationsResponse.data);
            } catch (err) {
                console.error('Error details:', err);
                setError('채팅방을 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchChatRoom();
    }, [id, token]);

    // router.query가 준비될 때까지 로딩 상태 유지
    if (!router.isReady) {
        return <div className={styles.container}>
            <div className={styles.chatContainer}>
                <div className={styles.loading}>로딩 중...</div>
            </div>
        </div>;
    }

    if (loading) {
        return <div className={styles.container}>
            <div className={styles.chatContainer}>
                <div className={styles.loading}>로딩 중...</div>
            </div>
        </div>;
    }

    if (error) {
        return <div className={styles.container}>
            <div className={styles.chatContainer}>
                <div className={styles.error}>{error}</div>
            </div>
        </div>;
    }

    if (!chatRoom || !token) {
        return <div className={styles.container}>
            <div className={styles.chatContainer}>
                <div className={styles.error}>채팅방을 찾을 수 없습니다.</div>
            </div>
        </div>;
    }

    const messages = conversations.flatMap(conv => convertConversationToMessage(conv, chatRoom.userId));

    return (
        <div className={styles.container}>
            <div className={styles.chatContainer}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <img
                            src="/images/Redi_profile.svg"
                            alt="프로필"
                            className={styles.headerProfileImage}
                        />
                        <h1 className={styles.headerTitle}>레디</h1>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className={styles.headerBackButton}
                    >
                        <img src="/icons/Exit_icon.svg" alt="뒤로가기" />
                    </button>
                </div>
                <ConversationSection
                    chatRoomId={chatRoom._id}
                    currentUser={{ id: chatRoom.userId, name: '사용자' }}
                    initialConversations={messages}
                />
            </div>
        </div>
    );
};

export default ChatRoom; 