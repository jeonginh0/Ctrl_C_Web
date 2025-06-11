import React from 'react';
import styles from '@/styles/MissingFactors.module.css';

type MissingFactorsProps = {
    missingFactors: string | null;
};

const MissingFactors: React.FC<MissingFactorsProps> = ({ missingFactors }) => {
    return (
        <div className={styles.mainContent}>
            <h1 className={styles.title}>
                누락 요인 <span className={styles.subtitle}>Missing factors</span>
            </h1>
            <div className={styles.divider}></div>

            <div className={styles.textBox}>
                <p>{missingFactors}</p>
            </div>
        </div>
    );
};

export default MissingFactors;
