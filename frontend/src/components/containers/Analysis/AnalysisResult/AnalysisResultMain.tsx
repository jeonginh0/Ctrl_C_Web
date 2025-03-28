import React, { JSX, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import ContractChecklist from './ContractChecklist';
import RiskFactors from './RiskFactors';
import MissingFactors from './MissingFactors';
import styles from '@/styles/AnalysisResultMain.module.css';

type AnalysisData = {
    checklist: Record<string, any>;
    riskFactors: string | null;
    missingFactors: string | null;
    image: string;
    sections: Record<string, {
        status: boolean;
        content: string | null;
        boundingBox: Array<{ x: number; y: number }>;
    }>;
};

const AnalysisResultMain: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('전체 분석 내용');

    const tabs = [
        '전체 분석 내용',
        '계약서 체크리스트',
        '위험 요인',
        '누락 요소'
    ];

    useEffect(() => {
        // Dummy Data (API로 교체)
        const dummyData = {
            checklist: {
                item1: '체크리스트 항목 1',
                item2: '체크리스트 항목 2',
            },
            riskFactors: '위험 요소 내용',
            missingFactors: '누락 요소 내용',
            image: '/path/to/image.jpg',
            sections: {
                section1: {
                    status: true,
                    content: '내용 1',
                    boundingBox: [{ x: 10, y: 10 }]
                },
                section2: {
                    status: false,
                    content: '내용 2',
                    boundingBox: [{ x: 20, y: 20 }]
                }
            }
        };

        setAnalysisData(dummyData);
        setLoading(false);
    }, []);

    if (loading) return <p>로딩 중...</p>;
    if (error) return <p>{error}</p>;

    const renderTabContent = () => {
        const components: Record<string, JSX.Element> = {
            '전체 분석 내용': (
                <div>
                    <ContractChecklist checklist={analysisData?.checklist || {}} />
                    <RiskFactors riskFactors={analysisData?.riskFactors || null} />
                    <MissingFactors missingFactors={analysisData?.missingFactors || null} />
                </div>
            ),
            '계약서 체크리스트': <ContractChecklist checklist={analysisData?.checklist || {}} />,
            '위험 요인': <RiskFactors riskFactors={analysisData?.riskFactors || null} />,
            '누락 요소': <MissingFactors missingFactors={analysisData?.missingFactors || null} />
        };

        return components[activeTab] || null;
    };

    return (
        <div className={styles.container}>
            <div className={styles.logo}>
                <Image
                    src="/images/Sub_Header.svg"
                    alt="Contract Document"
                    width={1920}
                    height={95}
                    layout="responsive"
                />
            </div>
            <div className={styles.title}>분석 결과</div>
            <div className={styles.analysisContainer}>
                <div className={styles.leftPanel}>
                    <p>업로드된 계약서가 여기에 표시됩니다.</p>
                </div>
                <div className={styles.rightPanel}>
                    <div className={styles.tabs}>
                        {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                        ))}
                    </div>
                    <div className={styles.tabContent}>
                        {renderTabContent()}
                    </div>
                    <div className={styles.actionButtons}>
                        <button className={styles.downloadButton}>분석 결과 다운로드</button>
                        <button className={styles.chatbotButton}>AI 챗봇 상담</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisResultMain;
