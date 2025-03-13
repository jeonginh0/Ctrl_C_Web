import LoginMain from '@/components/containers/Auth/Login/LoginMain'
import styles from '@/styles/AnalysisMain.module.css'

export default function Login() {
    return (
        <div>
            <div className={styles.container}>
                <LoginMain />
            </div>
        </div>
    );
}