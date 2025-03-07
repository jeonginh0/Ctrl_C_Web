"use client"

import Image from 'next/image'
import styles from '@/styles/Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Image src="/images/CTRL_C_Logo.png" alt="CTRL+C Logo" width={105} height={57} />
      </div>
      <nav className={styles.nav}>
        <ul>
          <li><a href="#">계약서 분석</a></li>
          <li><a href="#">계약 법률 설명</a></li>
          <li><a href="#">FAQ</a></li>
        </ul>
      </nav>
    </header>
  );
}