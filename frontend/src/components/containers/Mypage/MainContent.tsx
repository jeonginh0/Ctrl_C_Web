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
    const [chatRooms, setChatRooms] = useState<{ _id: string; title: string; consultationDate: string; }[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const limit = 5;

    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    // 클라이언트에서만 localStorage에 접근
    const [token, setToken] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                window.location.href = '/login';
                return;
            }
            setToken(storedToken);
        }
    }, []);
    
    const fetchUserData = async () => {
        if (!token) return;
        
        try {
            const response = await apiClient.get("/auth/profile", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                }
            });
            
            if (response.data) {
                setUserData(response.data);
            }
        } catch (error: any) {
            console.error("사용자 데이터를 가져오는 데 실패했습니다.", error);
            if (error.response?.status === 401) {
                localStorage.clear();
                window.location.href = '/login';
            }
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

    const handleEditClick = async (field: keyof UserInfo) => {
        setIsEditing(field);
        setEditedData({ ...editedData, [field]: userData?.[field] });
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedData({ ...editedData, [isEditing!]: e.target.value });
    };

    const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && isEditing && editedData[isEditing] !== undefined) {
            try {
                const updateData = { [isEditing]: editedData[isEditing] };
    
                const response = await apiClient.patch("/auth/update-profile", updateData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
    
                const newToken = response.data.updatedUser.token;
                if (newToken) {
                    localStorage.setItem("token", newToken);
                    setToken(newToken);
                }
    
                const updatedUserData = { ...userData, ...updateData };
    
                if (updatedUserData.username) {
                    localStorage.setItem("username", updatedUserData.username);
                }
    
                fetchUserData();
                setIsEditing(null);
    
            } catch (error) {
                console.error("사용자 정보 업데이트 실패:", error);
            }
        } else {
            console.warn("수정된 데이터가 없거나 편집 필드가 지정되지 않았습니다.");
        }
    };

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
    
            console.log("서버 응답:", response.data);
            
            const newImage = response.data.updatedUser.updatedUser.image;
            
            const newToken = response.data.updatedUser.token;
            
            if (newToken) {
                localStorage.removeItem("username");
                localStorage.removeItem("email");
                localStorage.removeItem("token");
                localStorage.removeItem("isLogin");
                localStorage.removeItem("role");
                localStorage.removeItem("image");
                
                localStorage.setItem("token", newToken); 
                localStorage.setItem("image", newImage); 
                localStorage.setItem("username", response.data.updatedUser.updatedUser.username); 
                localStorage.setItem("email", response.data.updatedUser.updatedUser.email);
                localStorage.setItem("role", response.data.updatedUser.updatedUser.role)
                localStorage.setItem("isLogin", "true");
                
                setToken(newToken);
            }
    
            setUserData((prev) =>
                prev ? { ...prev, image: newImage } : prev
            );
    
            window.location.reload();
    
        } catch (error) {
            console.error("프로필 이미지 업데이트 실패:", error);
        }
    };
    
    const handleImageClick = () => {
        const fileInput = document.getElementById("image-upload-input") as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    };

    useEffect(() => {
        if (selectedMenu === "채팅 보관") {
            fetchChatRooms(currentPage, limit);
        }
    }, [selectedMenu, currentPage]);

    const fetchChatRooms = async (page: number, limit: number) => {
        try {
            const response = await apiClient.get(`/chat-rooms/all?page=${page}&limit=${limit}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Chat rooms fetched:', response.data);
            setChatRooms(response.data.chatRooms);
        } catch (error) {
            console.error("채팅룸 목록을 가져오는 데 실패했습니다.", error);
        }
    };

    const handleRoomClick = (roomId: string) => {
        // 채팅룸 상세 페이지로 이동
        window.location.href = `/chatroom/${roomId}`;
    };

    const handleNextPage = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const handlePreviousPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    // 채팅룸 삭제 함수 추가
    const handleDeleteChatRoom = async (chatRoomId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (isDeleting) return;
        
        console.log('Attempting to delete chatRoom with ID:', chatRoomId); // 삭제하려는 채팅룸 ID 확인
        
        if (window.confirm('정말로 이 채팅방을 삭제하시겠습니까?')) {
            try {
                setIsDeleting(true);
                const response = await apiClient.delete(`/chat-rooms/${chatRoomId}/delete`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Delete response:', response); // 삭제 응답 확인
                
                // 삭제 후 채팅방 목록 새로고침
                fetchChatRooms(currentPage, limit);
                
            } catch (error) {
                console.error("채팅방 삭제 중 오류 발생:", error);
                alert('채팅방 삭제에 실패했습니다.');
            } finally {
                setIsDeleting(false);
            }
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
                                src={`${baseURL}${userData.image}`}
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
                                            className={styles.editimage}
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
                                className={styles.editimage}
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
            ) : selectedMenu === "채팅 보관" ? (
                <div>
                    <h1 className={styles.title}>채팅 보관</h1>
                    <p className={styles.subtitle}>
                        CTRL + C 서비스에서 진행한 상담 내역을 확인할 수 있습니다.
                    </p>
                    <div className={styles.chatCard}>
                        <div className={styles.chatRoomSection}>
                            {chatRooms.length > 0 ? (
                                <>
                                    <div className={styles.chatRoomHeader}>
                                        <span className={styles.headerNumber}>번호</span>
                                        <span className={styles.headerTitle}>제목</span>
                                        <span className={styles.headerDate}>상담 날짜</span>
                                        <span className={styles.headerAction}></span>
                                    </div>
                                    <ul className={styles.chatRoomList}>
                                        {chatRooms.map((room, index) => (
                                            <li key={room._id} className={styles.chatRoomItem}>
                                                <span className={styles.chatRoomNumber}>
                                                    {(currentPage - 1) * limit + index + 1}
                                                </span>
                                                <span 
                                                    className={styles.chatRoomName}
                                                    onClick={() => handleRoomClick(room._id)}
                                                >
                                                    {room.title}
                                                </span>
                                                <span className={styles.chatRoomDate}>
                                                    {room.consultationDate}
                                                </span>
                                                <button 
                                                    className={styles.deleteButton}
                                                    onClick={(e) => handleDeleteChatRoom(room._id, e)}
                                                    onMouseEnter={() => setHoveredId(room._id)}
                                                    onMouseLeave={() => setHoveredId(null)}
                                                    disabled={isDeleting}
                                                >
                                                    <ImageWrapper
                                                        src={hoveredId === room._id ? "/icons/Delete-hover.svg" : "/icons/Delete.svg"}
                                                        alt="delete"
                                                        width={20}
                                                        height={20}
                                                    />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <div className={styles.noChatRoom}>
                                    <p>저장된 채팅룸이 없습니다.</p>
                                </div>
                            )}
                        </div>
                        <div className={styles.pagination}>
                            <button 
                                className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`}
                                onClick={handlePreviousPage} 
                                disabled={currentPage === 1}
                            >
                                이전
                            </button>
                            <button 
                                className={styles.pageButton}
                                onClick={handleNextPage}
                            >
                                다음
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default MainContent;
