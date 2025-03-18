import React from "react";
import ImageWrapper from "@/components/common/inputs/ImageWrapper";
import styles from "@/styles/HeroSection.module.css";

const HeroSection: React.FC = () => {
    return (
        <section className={styles.hero}>
            <div className={styles.heroContent}>
                <ImageWrapper src="/images/Sub_Header.svg" alt="Contract Document" width={1920} height={95} />
            </div>
        </section>
    );
};

export default HeroSection;