"use client"

import Image from 'next/image'
import styles from '@/styles/Header.module.css'
import buttons from '@/styles/Button.module.css'
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

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
            <div className={buttons.loginButton}>
                <Link href="/login">로그인</Link>
            </div>
        </header>
    );
}