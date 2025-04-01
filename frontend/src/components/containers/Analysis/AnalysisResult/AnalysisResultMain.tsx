import React, { JSX, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import ContractChecklist from './ContractChecklist';
import RiskFactors from './RiskFactors';
import MissingFactors from './MissingFactors';
import styles from '@/styles/AnalysisResultMain.module.css';
import apiClient from '@/ApiClient';  // axios 클라이언트 import

type AnalysisData = {
    image: string;
    기본계약정보: Record<string, { status: boolean, content: string | null, boundingBox: Array<{ x: number; y: number }> }>;
    보증금및월세조건: Record<string, { status: boolean, content: string | null, boundingBox: Array<{ x: number; y: number }> }>;
    관리비및공과금부담명확화: Record<string, { status: boolean, content: string | null, boundingBox: Array<{ x: number; y: number }> }>;
    시설및수리책임조항: Record<string, { status: boolean, content: string | null, boundingBox: Array<{ x: number; y: number }> }>;
    전세계약시추가확인사항: Record<string, { status: boolean, content: string | null, boundingBox: Array<{ x: number; y: number }> }>;
    반전세계약시추가확인사항: Record<string, { status: boolean, content: string | null, boundingBox: Array<{ x: number; y: number }> }>;
    계약해지및갱신조건명시: Record<string, { status: boolean, content: string | null, boundingBox: Array<{ x: number; y: number }> }>;
    특약사항명시: Record<string, { status: boolean, content: string | null, boundingBox: Array<{ x: number; y: number }> }>;
    위험요인: string | null;
    누락요소: string | null;
    법률단어: string;
    createdAt: string;
    updatedAt: string;
    _id: string;
    userId: string;
};

const AnalysisResultMain: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('전체 분석 내용');
    const [token, setToken] = useState<string | null>(null);

    const tabs = [
        '전체 분석 내용',
        '계약서 체크리스트',
        '위험 요인',
        '누락 요소'
    ];

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            setToken(token);
        }
    }, []);

    useEffect(() => {
        if (!id || !token) return;
    
        const fetchAnalysisData = async () => {
            try {
                const response = await apiClient.get(`/analysis/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(response);
                setAnalysisData(response.data);
            } catch (error) {
                setError('데이터를 가져오는 데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };
    
        fetchAnalysisData();
    }, [id, token]);

    if (loading) return <p>로딩 중...</p>;
    if (error) return <p>{error}</p>;

    const renderTabContent = () => {
        const components: Record<string, JSX.Element> = {
            '전체 분석 내용': (
                <div>
                    <ContractChecklist checklist={analysisData?.기본계약정보 || {}} />
                    <RiskFactors riskFactors={analysisData?.위험요인 || null} />
                    <MissingFactors missingFactors={analysisData?.누락요소 || null} />
                </div>
            ),
            '계약서 체크리스트': <ContractChecklist checklist={analysisData?.기본계약정보 || {}} />,
            '위험 요인': <RiskFactors riskFactors={analysisData?.위험요인 || null} />,
            '누락 요소': <MissingFactors missingFactors={analysisData?.누락요소 || null} />
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
