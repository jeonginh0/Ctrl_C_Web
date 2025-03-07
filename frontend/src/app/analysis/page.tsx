// pages/index.tsx
import Main from '@/app/components/Main'
import Footer from '@/app/components/Footer'
import styles from '@/app/styles/Home.module.css'

export default function Analysis() {
    return (
        <div className={styles.container}>
            <Main />
            <Footer />
        </div>
    );
}
