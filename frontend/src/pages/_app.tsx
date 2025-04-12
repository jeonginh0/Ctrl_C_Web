import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Header from "@/components/common/layout/Header";
import Footer from "@/components/common/layout/Footer";
import Head from "next/head";
import { AuthProvider } from '@/contexts/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>CTRL+C - 부동산 계약서 분석</title>
      </Head>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </AuthProvider>
  );
}