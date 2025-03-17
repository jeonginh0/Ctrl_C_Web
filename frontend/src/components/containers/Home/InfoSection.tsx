import React, { useState, useRef, useEffect } from "react";
import Accordion from "@/components/common/inputs/Accordion";
import ImageWrapper from "@/components/common/inputs/ImageWrapper";
import styles from "@/styles/InfoSection.module.css";
import Accordions from "@/styles/Accordion.module.css"

const InfoSection: React.FC = () => {
    const infoRef = useRef(null);
    const [infoInView, setInfoInView] = useState(false);
    const [openAccordion, setOpenAccordion] = useState<string | null>('summary');

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.target === infoRef.current) {
            setInfoInView(entry.isIntersecting);
            }
        });
        }, { threshold: 0.5 });

        if (infoRef.current) observer.observe(infoRef.current);

        return () => observer.disconnect();
    }, []);

    const toggleAccordion = (id: string) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };

    const accordionItems = [
        {
            id: 'summary',
            title: '계약서 요약 및 정리',
            content: '업로드한 계약서를 AI가 분석하여 주요 내용을 정리합니다.',
            iconSrc: '/images/Main_service1.png',
        },
        {
            id: 'risk',
            title: '위험요소·누락요소 검토',
            content: '계약서를 분석하여 위험요소와 누락요소를 검토합니다.',
            iconSrc: '/images/Main_service2.png',
        },
        {
            id: 'compare',
            title: 'AI 챗봇 상담',
            content: '부동산 계약과 관련된 궁금한 점을 AI 챗봇에게 질문하고 답변을 받을 수 있습니다.',
            iconSrc: '/images/Main_service3.png',
        },
        {
            id: 'download',
            title: '분석 결과 다운로드',
            content: '계약서 분석 결과를 PDF 형식으로 다운로드 할 수 있습니다.',
            iconSrc: '/images/Main_service4.png',
        }
    ];

    return (
        <section className={`${styles.infoSection} ${infoInView ? styles.visible : ''}`} ref={infoRef}>
            <div className={styles.infoContainer}>
                <div className={styles.dashboardImage}>
                    <ImageWrapper src="/images/talk.png" alt="Dashboard" width={600} height={600} />
                </div>
                <div className={styles.serviceInfo}>
                    <h2 className={styles.serviceTitle}>CTRL+C AI</h2>
                    <div className={Accordions.accordionContainer}>
                        {accordionItems.map((item) => (
                            <Accordion 
                                key={item.id}
                                id={item.id}
                                title={item.title}
                                content={item.content}
                                iconSrc={item.iconSrc}
                                isOpen={openAccordion === item.id}
                                toggleAccordion={toggleAccordion}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InfoSection;