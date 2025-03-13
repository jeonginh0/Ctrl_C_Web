import FindPasswordMain from '@/components/containers/Auth/FindPassword/FindPasswordMain'
import styles from '@/styles/AnalysisMain.module.css'

export default function FindPassword() {
    return (
        <div>
            <div className={styles.container}>
                <FindPasswordMain />
            </div>
        </div>
    );
}