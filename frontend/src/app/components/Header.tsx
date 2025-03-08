"use client"

import Image from 'next/image'
import styles from '@/app/styles/Header.module.css'
import Link from 'next/link';

export default function Header() {
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
            <Link href='/analysis'>계약서 분석</Link>
          </li>
          <li><a href="#">계약 법률 설명</a></li>
          <li><a href="#">FAQ</a></li>
        </ul>
      </nav>
    </header>
  );
}