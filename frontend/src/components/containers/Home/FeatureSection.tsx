'use Client'

import React from "react";
import Button from "@/components/common/inputs/Button";
import ImageWrapper from "@/components/common/inputs/ImageWrapper";
import styles from "@/styles/FeatureSection.module.css";
import buttons from "@/styles/Button.module.css"
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const FeatureSection: React.FC = () => {
    const featureRef = useRef(null);
    const [featureInView, setFeatureInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
        if (entry.target === featureRef.current) {
            setFeatureInView(entry.isIntersecting);
        }
        }, { threshold: 0.5 });

        if (featureRef.current) observer.observe(featureRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <section 
            className={`${styles.featureSection} ${featureInView ? styles.visible : ""}`}
            ref={featureRef}
        >
            <div className={styles.featureContent}>
                <div className={styles.featureText}>
                    <h2 className={styles.featureTitle}>이제 계약서 분석도 자동으로</h2>
                    <p className={styles.featureDescription}>
                        계약서 요약 및 정리, 위험요소 & 누락요소 검토 등 여러 기능을 제공합니다
                    </p>
                    <Link href="/analysis">
                        <Button className={buttons.button}>분석하기</Button>
                    </Link>
                </div>
                <div className={styles.featureImage}>
                    <ImageWrapper src="/images/Main_Contract_Image1.png" alt="Contract Document" width={600} height={600} />
                </div>
            </div>
        </section>
    );
};

export default FeatureSection;
