import AnalysisMain from '@/app/components/AnalysisMain'
import Footer from '@/app/components/Footer'
import styles from '@/app/styles/Home.module.css'
import Head from 'next/head';

export default function Login() {
    return (
        <div>
            <Head>
                <title>계약서 분석 - CTRL+C AI</title>
            </Head>
            <div className={styles.container}>
                <AnalysisMain />
                <Footer />
            </div>
        </div>
    );
}
