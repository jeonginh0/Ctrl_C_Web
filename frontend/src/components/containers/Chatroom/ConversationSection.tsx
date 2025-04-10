import { useEffect, useRef, useState } from 'react';
import styles from '@/styles/ConversationSection.module.css';
import { FiSend } from 'react-icons/fi';
import apiClient from '@/api/client';

interface Message {
    id: string;
    userResponse?: string;
    gptResponse?: string;
    userCreatedAt?: string;
    gptCreatedAt?: string;
    isRead: boolean;
}

interface ConversationSectionProps {
    chatRoomId: string;
    currentUser: {
        id: string;
        name: string;
    } | null;
    initialConversations?: Message[];
}

export default function ConversationSection({
    chatRoomId,
    currentUser,
    initialConversations = [],
}: ConversationSectionProps) {
    const [messages, setMessages] = useState<Message[]>(initialConversations);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [userImage, setUserImage] = useState<string>('');

    useEffect(() => {
        const image = localStorage.getItem('image');
        if (image) setUserImage(image);
    }, []);

    const formatTime = (dateString?: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadMessages = async () => {
        try {
            const response = await apiClient.get(`/chat-rooms/${chatRoomId}/conversations`);
            if (Array.isArray(response.data)) {
                const processed = response.data.map((msg, idx) => {
                    if (idx === 0 && msg.gptResponse) {
                        const trimmed = msg.gptResponse.split('(')[0].trim();
                        return {
                            ...msg,
                            gptResponse: trimmed.length > 0 ? trimmed : msg.gptResponse,
                        };
                    }
                    return msg;
                });
                setMessages(processed);
            }
        } catch (err) {
            console.error('Error loading messages:', err);
            setError('메시지를 불러오는데 실패했습니다.');
        }
    };

    useEffect(() => {
        loadMessages();
        scrollToBottom();
    
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [chatRoomId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !currentUser) return;
    
        const userMsg = newMessage;
        setNewMessage('');
        scrollToBottom();
    
        const tempId = Date.now().toString();
        const tempMessage: Message = {
            id: tempId,
            userResponse: userMsg,
            gptResponse: '레디가 생각 중입니다...',
            userCreatedAt: new Date().toISOString(),
            isRead: false,
        };
    
        setMessages((prev) => [...prev, tempMessage]);
    
        try {
            setIsLoading(true);
            setError(null);
          
            await apiClient.post(`/conversations/send/${chatRoomId}`, {
              userResponse: userMsg,
            });
          
            await loadMessages();
        } catch (err) {
            console.error('Error sending message:', err);
            setError('메시지 전송에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.messageList}>
                {messages.map((message) => (
                    <div key={message.id}>
                        {message.userResponse && (
                            <div className={`${styles.messageWrapper} ${styles.myMessageWrapper}`}>
                                {userImage && (
                                    <img
                                        src={userImage}
                                        alt="프로필"
                                        className={styles.messageProfileImage}
                                    />
                                )}
                                <div className={styles.messageWithTimestamp}>
                                    <div className={`${styles.message} ${styles.myMessage}`}>
                                        <div className={styles.messageContent}>
                                            <p className={styles.content}>{message.userResponse}</p>
                                        </div>
                                    </div>
                                    <div className={`${styles.timestamp} ${styles.myTimestamp}`}>
                                        {formatTime(message.userCreatedAt)}
                                    </div>
                                </div>
                            </div>
                        )}
                        {message.gptResponse && (
                            <div className={styles.messageWrapper}>
                                <img
                                    src="/images/Redi_profile.svg"
                                    alt="레디 프로필"
                                    className={styles.messageProfileImage}
                                />
                                <div className={styles.messageWithTimestamp}>
                                    <div className={`${styles.message} ${styles.otherMessage}`}>
                                        <div className={styles.messageContent}>
                                            <p className={styles.content}>{message.gptResponse}</p>
                                        </div>
                                    </div>
                                    <div className={`${styles.timestamp} ${styles.otherTimestamp}`}>
                                        {formatTime(message.gptCreatedAt)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    placeholder="메시지를 입력하세요..."
                    className={styles.messageInput}
                    disabled={isLoading}
                />
                <button
                    onClick={handleSendMessage}
                    className={styles.sendButton}
                    disabled={isLoading || !newMessage.trim()}
                >
                    <FiSend size={20} />
                </button>
            </div>
        </div>
    );
}
