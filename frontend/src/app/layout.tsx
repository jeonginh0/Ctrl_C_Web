import '@/app/styles/globals.css';
import Header from '@/app/components/Header';
import Head from 'next/head';

export default function RootLayout({ children,}: { children: React.ReactNode; }) {
  return (
    <html lang="ko">
      <Head>
        <meta name="description" content="사회 초년생을 위한 자동 계약서 검토 서비스를 무료로 사용해 보세요." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <body>{children}</body>
    </html>
  );
}
