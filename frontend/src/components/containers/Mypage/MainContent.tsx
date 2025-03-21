import React, { useEffect, useState } from "react";
import styles from "@/styles/MainContent.module.css";
import apiClient from '../../../ApiClient';

interface MainContentProps {
    selectedMenu: string;
}

interface UserInfo {
    image: string;
    email: string;
    username: string;
    password: string;
    createAt: Date;
}

const MainContent: React.FC<MainContentProps> = ({ selectedMenu }) => {
    const [userData, setUserData] = useState<UserInfo | null>(null);

    // 백엔드에서 사용자 정보를 가져오는 함수
    const fetchUserData = async () => {
        try {
            const response = await apiClient.get("/api/getUserData"); // apiClient를 사용하여 GET 요청
            setUserData(response.data); // 응답 데이터를 상태에 저장
        } catch (error) {
            console.error("사용자 데이터를 가져오는 데 실패했습니다.", error);
        }
    };
    
    useEffect(() => {
        // 컴포넌트 마운트 시 사용자 정보 가져오기
        fetchUserData();
    }, []); // 빈 배열을 넣으면 컴포넌트가 처음 렌더링될 때만 실행됨

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    return (
        <div className={styles.mainContent}>
            {selectedMenu === "기본 정보" && userData ? (
                <div>
                    <h1 className={styles.title}>기본 정보</h1>
                    <p className={styles.subtitle}>
                        CTRL + C 서비스 계정의 개인 정보를 관리할 수 있습니다.
                    </p>
                    <div className={styles.card}>
                        <div className={styles.profileSection}>
                            <p>프로필 사진</p>
                            <span>프로필 변경 가능</span>
                            <img
                                src={userData.image} // 백엔드에서 가져온 이미지
                                alt="Profile"
                                className={styles.profileImage}
                            />
                        </div>
                        <div className={styles.infoRow}>
                            <p>이메일</p>
                            <span>{userData.email}</span> {/* 이메일 데이터 */}
                        </div>
                        <div className={styles.infoRow}>
                            <p>이름</p>
                            <span>{userData.username}</span> {/* 이름 데이터 */}
                        </div>
                        <div className={styles.infoRow}>
                            <p>비밀번호</p>
                            <span>{userData.password}</span> {/* 비밀번호 데이터 */}
                        </div>
                        <div className={styles.infoRow}>
                            <p>가입일</p>
                            <span>{formatDate(new Date(userData.createAt))}</span> {/* 가입일 데이터 */}
                        </div>
                    </div>
                    <button className={styles.deleteBtn}>회원탈퇴</button>
                </div>
            ) : (
                <div>
                    <h1 className={styles.title}>채팅 보관</h1>
                    <p>저장된 채팅이 없습니다.</p>
                </div>
            )}
        </div>
    );
};

export default MainContent;
