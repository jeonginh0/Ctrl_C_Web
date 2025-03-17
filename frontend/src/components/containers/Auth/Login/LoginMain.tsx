import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/LoginMain.module.css";
import Button from "@/components/common/inputs/Button";
import buttons from "@/styles/Button.module.css";
import React from "react";
import ImageWrapper from "@/components/common/inputs/ImageWrapper";
import Link from "next/link";

export default function LoginMain() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
        
            if (!response.ok) {
                throw new Error("로그인 실패");
            }
        
            const data = await response.json();
            console.log("로그인 성공", data);

            const userData = {
                username: data.user.username,
                role: data.user.role,
                email: data.user.email,
                token: data.token,
                isLogin: !!data.token,
            };

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(userData));

            router.push("/");
        } catch (error) {
            setError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>
                    CTRL + C 서비스 계정으로
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
