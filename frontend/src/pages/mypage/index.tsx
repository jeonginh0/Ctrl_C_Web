import React, { useState } from "react";
import Sidebar from '@/components/containers/Mypage/Sidebar'
import MainContent from "@/components/containers/Mypage/MainContent";
import styles from '@/styles/Mypage.module.css'

export default function Mypage() {
    const [selectedMenu, setSelectedMenu] = useState("기본 정보");

    return (
        <div>
            <div className={styles.container}>
                <Sidebar selectedMenu={selectedMenu} onSelect={setSelectedMenu} />
                <MainContent selectedMenu={selectedMenu} />
            </div>
        </div>
    );
}