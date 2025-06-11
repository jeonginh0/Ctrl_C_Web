import React from 'react';
import styles from '@/styles/RiskFactors.module.css'

type RiskFactorsProps = {
    riskFactors: string | null;
};

const RiskFactors: React.FC<RiskFactorsProps> = ({ riskFactors }) => {
    return (
        <div className={styles.mainContent}>
            <h1 className={styles.title}>
                위험 요인 <span className={styles.subtitle}>Risk factors</span>
            </h1>
            <div className={styles.divider}></div>

            <div className={styles.textBox}>
                <p>{riskFactors}</p>
            </div>
        </div>
    );
};

export default RiskFactors;
