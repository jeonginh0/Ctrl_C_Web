import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/FindPassword.module.css";
import Button from "@/components/common/inputs/Button";
import buttons from "@/styles/Button.module.css";
import React from "react";
import Link from "next/link";

export default function FindPasswordMain() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const router = useRouter();

    const handleFindPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:3000/api/find-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, email }),
            });
        
            if (!response.ok) {
                throw new Error("비밀번호 찾기 실패");
            }
        
            const data = await response.json();
            console.log("비밀번호 생성, 이메일로 비밀번호 전송", data);
            router.push("/login");
        } catch (error) {
            console.error("비밀번호 찾기 실패", error);
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
                    <Button type="submit" className={buttons.loginClickButton}>비밀번호 찾기</Button>
                </form>
                <div className={styles.linkContainer}>
                <Link href="/login" className={styles.findlink}>로그인</Link>
                </div>
            </div>
        </div>
    );
}
