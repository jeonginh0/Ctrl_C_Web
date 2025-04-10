import { useEffect, useRef, useState } from 'react';
import styles from '@/styles/ConversationSection.module.css';
import { FiSend } from 'react-icons/fi';

interface Message {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    isRead: boolean;
}

interface ConversationSectionProps {
    roomId: string;
    currentUser: {
        id: string;
        name: string;
    };
}

export default function ConversationSection({ roomId, currentUser }: ConversationSectionProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: currentUser.id,
            content: '안녕하세요!',
            timestamp: new Date().toISOString(),
            isRead: true
        },
        {
            id: '2',
            sender: 'other-user',
            content: '반갑습니다!',
            timestamp: new Date().toISOString(),
            isRead: true
        }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        loadMessages();
        scrollToBottom();
    }, [roomId]);

    const loadMessages = async () => {
        try {
            setIsLoading(true);
            setError(null);
            // TODO: fetch 메시지 API
        } catch (err) {
            setError('메시지를 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            setIsLoading(true);
            setError(null);
            const message: Message = {
                id: Date.now().toString(),
                sender: currentUser.id,
                content: newMessage,
                timestamp: new Date().toISOString(),
                isRead: false
            };
            setMessages(prev => [...prev, message]);
            setNewMessage('');
            scrollToBottom();
        } catch (err) {
            setError('메시지 전송에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.messageList}>
                {isLoading && messages.length === 0 && (
                    <div className={styles.loading}>메시지를 불러오는 중...</div>
                )}
                {error && <div className={styles.error}>{error}</div>}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`${styles.messageWrapper} ${message.sender === currentUser.id ? styles.myMessageWrapper : ''}`}
                    >
                        <img
                            src="/images/Redi_profile.svg"
                            alt="프로필"
                            className={styles.messageProfileImage}
                        />
                        <div className={styles.messageWithTimestamp}>
                            <div
                                className={`${styles.message} ${message.sender === currentUser.id ? styles.myMessage : styles.otherMessage}`}
                            >
                                <div className={styles.messageContent}>
                                    <p className={styles.content}>{message.content}</p>
                                </div>
                            </div>
                            <div className={`${styles.timestamp} ${message.sender === currentUser.id ? styles.myTimestamp : styles.otherTimestamp}`}>
                                {formatTimestamp(message.timestamp)}
                                {message.sender === currentUser.id && (
                                    <span className={styles.readStatus}>
                                        {message.isRead ? '읽음' : '전송됨'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputContainer}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
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
