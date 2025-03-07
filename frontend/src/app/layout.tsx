'use client'

import '@/app/styles/globals.css'
import Header from '@/app/components/Header'
import Head from 'next/head'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <Head>
        <title>CTRL+C AI - 계약서 분석 서비스</title>
        <meta name="description" content="사이 초년생을 위한 자동 계약서 검토 서비스를 무료로 사용해 보세요." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <head />
      <body>{children}</body>
    </html>
  );
}