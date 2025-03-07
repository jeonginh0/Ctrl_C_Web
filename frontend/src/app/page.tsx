// pages/index.tsx
"use client"

import Head from 'next/head'
import Header from '@/components/Header'
import Main from '@/components/Main'
import Footer from '@/components/Footer'
import styles from '@/styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>CTRL+C AI - 계약서 분석 서비스</title>
        <meta name="description" content="사이 초년생을 위한 자동 계약서 검토 서비스를 무료로 사용해 보세요." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <Main />
      <Footer />
    </div>
  );
}