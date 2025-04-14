import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/LoginMain.module.css";
import Button from "@/components/common/inputs/Button";
import buttons from "@/styles/Button.module.css";
import React from "react";
import ImageWrapper from "@/components/common/inputs/ImageWrapper";
import Link from "next/link";
import apiClient from '../../../../ApiClient';
import { AxiosResponse } from "axios";

export default function LoginMain() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response: AxiosResponse<{ token: string; user: { username: string; email: string; image: string; createAt: Date; role: string } }> = await apiClient.post(
                "/auth/login", 
                { email, password }
            );
    
            console.log("로그인 성공", response.data);
    
            const isLogin = !!response.data.token;
    
            try {
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("username", response.data.user.username);
                localStorage.setItem("email", response.data.user.email);
                localStorage.setItem("role", response.data.user.role);
                localStorage.setItem("image", response.data.user.image);
                localStorage.setItem("isLogin", JSON.stringify(isLogin));
    
                console.log("LocalStorage 저장 성공");
            } catch (error) {
                console.error("LocalStorage 저장 실패:", error);
            }
    
            window.dispatchEvent(new Event("storage"));
    
            router.push("/");
        } catch (error: any) {
            if (error.response && error.response.data) {
                setError(error.response.data.message || "로그인 실패");
            } else {
                setError("알 수 없는 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>
                    Renalyze 서비스 계정으로
                </h2>
                <p className={styles.subTitle}>
                    서비스를 이용하세요.
                </p>
                <p className={styles.description}>
                    신규 사용자이신가요?{" "}
                    <Link href="/signup" className={styles.link}>계정 만들기</Link>
                </p>
                <form onSubmit={handleLogin}>
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
                    <div className={styles.inputGroup}>
                        <input
                        type={passwordVisible ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        placeholder="비밀번호"
                        required
                        />
                        <ImageWrapper src="/icons/EyeIcon.svg" alt="Eye Icon" className={styles.eyeIcon} onClick={() => setPasswordVisible(!passwordVisible)} width={40} height={40} />
                    </div>
                    <Button type="submit" className={buttons.loginClickButton}>로그인</Button>
                </form>
                <div className={styles.linkContainer}>
                <Link href="/find-password" className={styles.findlink}>비밀번호 찾기</Link>
                </div>
            </div>
        </div>
    );
}
