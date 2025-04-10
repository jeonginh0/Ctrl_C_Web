import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ConversationSection from '@/components/containers/Chatroom/ConversationSection';
import styles from '@/styles/ChatRoom.module.css';

export default function ChatRoom() {
    const router = useRouter();
    const { roomId } = router.query;
    const [currentUser, setCurrentUser] = useState({
        id: 'user123', // 임시 사용자 ID
        name: '사용자' // 임시 사용자 이름
    });
    const [isClient, setIsClient] = useState(false);

    // 클라이언트 사이드에서만 실행
    useEffect(() => {
        setIsClient(true);
    }, []);

    // 퍼블리싱 단계에서는 임시 roomId 사용
    const displayRoomId = roomId || 'temp-room-123';

    // 뒤로가기 버튼 클릭 핸들러
    const handleBackClick = () => {
        router.back();
    };

    // 서버 사이드 렌더링 시에는 기본 UI만 표시
    if (!isClient) {
        return (
            <div className={styles.container}>
                <div className={styles.chatContainer}>
                    <div className={styles.loading}>로딩 중...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.chatContainer}>
                <div className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <img 
                            src="/images/Redi_profile.svg" 
                            alt="프로필" 
                            className={styles.headerProfileImage}
                        />
                        <h1 className={styles.headerTitle}>레디</h1>
                    </div>
                    <button 
                        className={styles.headerBackButton}
                        onClick={handleBackClick}
                        aria-label="뒤로 가기"
                    >
                        <img src="/icons/Exit_icon.svg" alt="뒤로가기" />
                    </button>
                </div>
                <ConversationSection 
                    roomId={displayRoomId as string} 
                    currentUser={currentUser} 
                />
            </div>
        </div>
    );
}