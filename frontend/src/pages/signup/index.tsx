import SignupMain from '@/components/containers/Auth/Signup/SignupMain'
import styles from '@/styles/Signup.module.css'

export default function Signup() {
    return (
        <div>
            <div className={styles.container}>
                <SignupMain />
            </div>
        </div>
    );
}