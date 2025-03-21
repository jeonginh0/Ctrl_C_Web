import React, { useEffect, useState } from "react";
import styles from "@/styles/MainContent.module.css";
import ImageWrapper from "@/components/common/inputs/ImageWrapper";
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
    const [isEditing, setIsEditing] = useState<keyof UserInfo | null>(null);
    const [editedData, setEditedData] = useState<Partial<UserInfo>>({});

    // 클라이언트에서만 localStorage에 접근
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem('token');
            setToken(token);
        }
    }, []);
    
    const fetchUserData = async () => {
        try {
            const response = await apiClient.get("/auth/profile");
            setUserData(response.data);
        } catch (error) {
            console.error("사용자 데이터를 가져오는 데 실패했습니다.", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUserData();
        }
    }, [token]); 

    const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    const handleEditClick = (field: keyof UserInfo) => {
        setIsEditing(field);
        setEditedData({ ...editedData, [field]: userData?.[field] });
    };

    // 입력값 변경 핸들러
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedData({ ...editedData, [isEditing!]: e.target.value });
    };

    // 수정 완료 후 저장 (Enter 키)
    const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && isEditing && editedData[isEditing] !== undefined) {
            try {
                const updateData = { [isEditing]: editedData[isEditing] };
                await apiClient.patch("/auth/update-profile", updateData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                fetchUserData(); // 데이터 갱신
                setIsEditing(null);
            } catch (error) {
                console.error("사용자 정보 업데이트 실패:", error);
            }
        } else {
            console.warn("수정된 데이터가 없거나 편집 필드가 지정되지 않았습니다.");
        }
    };

    // 프로필 이미지 변경 핸들러
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;

        const formData = new FormData();
        formData.append("image", event.target.files[0]);

        try {
            const response = await apiClient.patch("/auth/update-profile", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            setUserData((prev) => (prev ? { ...prev, image: response.data.updatedUser.image } : prev));
        } catch (error) {
            console.error("프로필 이미지 업데이트 실패:", error);
        }
    };

    // 이미지 파일 입력을 트리거하는 함수
    const handleImageClick = () => {
        const fileInput = document.getElementById("image-upload-input") as HTMLInputElement;
        if (fileInput) {
            fileInput.click(); // 파일 입력 창 열기
        }
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
                                src={userData.image}
                                alt="Profile"
                                className={styles.profileImage}
                                onClick={handleImageClick} // 클릭 시 파일 선택창 열기
                            />
                            <input
                                type="file"
                                id="image-upload-input"
                                style={{ display: "none" }}
                                onChange={handleImageUpload}
                            />
                        </div>
                        <div className={styles.infoRow}>
                            <p>이메일</p>
                            <span>{userData.email}</span>
                        </div>
                        <div className={styles.infoRow}>
                            <p>이름</p>
                            <span>
                                {isEditing === "username" ? (
                                    <input
                                        type="text"
                                        value={editedData.username || ""}
                                        onChange={handleChange}
                                        onKeyPress={handleKeyPress}
                                        autoFocus
                                    />
                                ) : (
                                    <>
                                        {userData.username}
                                        <ImageWrapper
                                            src="/icons/Edit-Icon.svg"
                                            alt="username edit"
                                            width={15}
                                            height={15}
                                            onClick={() => handleEditClick("username")}
                                        />
                                    </>
                                )}
                            </span>
                        </div>
                        <div className={styles.infoRow}>
                        <p>비밀번호</p>
                        <span>
                            {isEditing === "password" ? (
                            <input
                                type="password"
                                value={editedData.password || ""}
                                onChange={handleChange}
                                onKeyPress={handleKeyPress}
                                autoFocus
                            />
                            ) : (
                            <>
                                {"*******"}
                                <ImageWrapper
                                src="/icons/Edit-Icon.svg"
                                alt="password edit"
                                width={15}
                                height={15}
                                onClick={() => handleEditClick("password")}
                                />
                            </>
                            )}
                        </span>
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
