import { useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/SuccessSignup.module.css";
import Button from "@/components/common/inputs/Button";
import buttons from "@/styles/Button.module.css";
import React from "react";
import ImageWrapper from "@/components/common/inputs/ImageWrapper";
import Link from "next/link";

export default function SuccessSignupMain() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <ImageWrapper src="/images/Check_Circle.svg" alt="Contract Document" width={275} height={275} />
                <h2 className={styles.title}>회원가입이 완료되었습니다.</h2>
                <Link href="/login">
                    <Button className={buttons.goToLoginPage}>로그인하러 가기</Button>
                </Link>
            </div>
        </div>
    );
}
