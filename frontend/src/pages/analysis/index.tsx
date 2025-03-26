import dynamic from 'next/dynamic';
import styles from '@/styles/AnalysisMain.module.css'

const AnalysisMain = dynamic(() => import('@/components/containers/Analysis/AnalysisMain'), {
    ssr: false,
});

export default function Analysis() {
    return (
        <div>
            <div className={styles.container}>
                <AnalysisMain />
            </div>
        </div>
    );
}