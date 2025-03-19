"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image'
import styles from '@/styles/Header.module.css'
import buttons from '@/styles/Button.module.css'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
    const pathname = usePathname();
    const [user, setUser] = useState<{ username: string | null; isLogin: boolean } | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const username = localStorage.getItem('username');
        const isLogin = localStorage.getItem('isLogin') === 'true';

        if (isLogin && username) {
            setUser({ username, isLogin });
        } else {
            setUser(null);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('token');
        localStorage.removeItem('isLogin');
        setUser(null);
    };

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <Link href="/">
                    <Image src="/images/CTRL_C_Logo.png" alt="CTRL+C Logo" width={105} height={57} />
                </Link>
            </div>
            <nav className={styles.nav}>
                <ul>
                    <li>
                        <Link 
                            href='/analysis'
                            className={pathname === '/analysis' ? styles.active : ''}
                        >
                        계약서 분석
                        </Link>
                    </li>
                    <li>
                        <Link 
                            href="/description"
                            className={pathname === '/description' ? styles.active : ''}
                        >
                        계약 법률 설명
                        </Link>
                    </li>
                    <li>
                        <Link 
                            href="/faq"
                            className={pathname === '/faq' ? styles.active : ''}
                        >
                        FAQ
                        </Link>
                    </li>
                </ul>
            </nav>
            <div className={styles.userSection}>
                {user?.isLogin ? (
                    <div className={styles.profileWrapper} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <Image src="/images/user_avatar.png" alt="프로필 이미지" width={40} height={40} className={styles.profileImage} />
                        <span className={styles.username}>{user.username} 님</span>
                        {isDropdownOpen && (
                            <div className={styles.dropdownMenu}>
                                <Link href="/profile" className={styles.dropdownItem}>🔧 정보변경</Link>
                                <button className={styles.dropdownItem} onClick={handleLogout}>🚪 로그아웃</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link href="/login" className={buttons.loginButton}>로그인</Link>
                )}
            </div>
        </header>
    );
}