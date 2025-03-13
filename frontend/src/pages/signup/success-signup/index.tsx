import SuccessSignupMain from '@/components/containers/Auth/Signup/SuccessSignupMain'
import styles from '@/styles/AnalysisMain.module.css'

export default function SuccessSignup() {
    return (
        <div>
            <div className={styles.container}>
                <SuccessSignupMain />
            </div>
        </div>
    );
}