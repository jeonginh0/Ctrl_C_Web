import AnalysisMain from '@/components/containers/Analysis/AnalysisMain'
import styles from '@/styles/AnalysisMain.module.css'

export default function Analysis() {
    return (
        <div>
            <div className={styles.container}>
                <AnalysisMain />
            </div>
        </div>
    );
}