import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/FindPassword.module.css";
import Button from "@/components/common/inputs/Button";
import buttons from "@/styles/Button.module.css";
import React from "react";
import Link from "next/link";
import ApiClient from "@/ApiClient";
import Modal from "@/components/common/modals/Modal";

export default function FindPasswordMain() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const router = useRouter();

    const handleFindPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('비밀번호 찾기 요청 데이터:', { name, email });

            const response = await ApiClient.post("/auth/find-password", {
                username,
                email,
            });

            console.log('비밀번호 찾기 응답:', response.data);
            setIsSuccess(true);
            setShowModal(true);
        } catch (error: any) {
            console.error('비밀번호 찾기 에러 상세:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    data: error.config?.data,
                }
            });
            setIsSuccess(false);
            setShowModal(true);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
        if (isSuccess) {
            router.push("/login");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>
                    비밀번호 찾기
                </h2>
                <form onSubmit={handleFindPassword}>
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={styles.input}
                            placeholder="이름"
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            placeholder="이메일"
                            required
                        />
                    </div>
                    <Button type="submit" className={buttons.loginClickButton}>
                        비밀번호 찾기
                    </Button>
                </form>
                <div className={styles.linkContainer}>
                    <Link href="/login" className={styles.findlink}>
                        로그인
                    </Link>
                </div>
            </div>

            {showModal && (
                <Modal>
                    <div className={styles.modalContent}>
                        <h3>{isSuccess ? "비밀번호 찾기 완료" : "비밀번호 찾기 실패"}</h3>
                        <p>
                            {isSuccess 
                                ? "임시 비밀번호가 이메일로 전송되었습니다." 
                                : "이름과 이메일을 확인해주세요."}
                        </p>
                        <Button 
                            onClick={handleModalClose}
                            className={buttons.confirmButton}
                        >
                            확인
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
