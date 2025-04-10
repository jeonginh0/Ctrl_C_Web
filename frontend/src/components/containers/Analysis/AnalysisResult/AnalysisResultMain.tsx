import React, { JSX, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import ContractChecklist from './ContractChecklist';
import RiskFactors from './RiskFactors';
import MissingFactors from './MissingFactors';
import styles from '@/styles/AnalysisResultMain.module.css';
import apiClient from '@/ApiClient';  // axios 클라이언트 import
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuth } from '@/contexts/AuthContext';

type BoundingBox = { x: number; y: number; };

type SectionData = {
    status: boolean;
    content: string | null;
    boundingBox: Array<{ x: number; y: number }> | null;  // null을 허용
    _id: string;
};

// ContractChecklist에서 요구하는 ChecklistItem 타입 정의
type ChecklistItem = {
    title: string;
    status: boolean;
    content: string;
    boundingBox: Array<{ x: number; y: number }>;
    _id: string;
};

type AnalysisData = {
    image: string;
    imageWidth: number;
    imageHeight: number;
    기본계약정보?: Record<string, SectionData>;
    보증금및월세조건?: Record<string, SectionData>;
    관리비및공과금부담명확화?: Record<string, SectionData>;
    시설및수리책임조항?: Record<string, SectionData>;
    전세계약시추가확인사항?: Record<string, SectionData>;
    반전세계약시추가확인사항?: Record<string, SectionData>;
    계약해지및갱신조건명시?: Record<string, SectionData>;
    특약사항명시?: Record<string, SectionData>;
    위험요인?: string | null;
    누락요소?: string | null;
    법률단어?: string;
    createdAt: string;
    updatedAt: string;
    _id: string;
    userId: string;
};

const AnalysisResultMain: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const imageRef = useRef<HTMLImageElement>(null);
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('전체 분석 내용');
    const [token, setToken] = useState<string | null>(null);
    const [highlightedBox, setHighlightedBox] = useState<Array<{ x: number; y: number }> | null>(null);
    const [user, setUser] = useState<any | null>(null);
    
    const tabs = [
        '전체 분석 내용',
        '계약서 체크리스트',
        '위험 요인',
        '누락 요인'
    ];

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            setToken(token);
            setUser(user);
        }
    }, []);

    useEffect(() => {
        if (!id || !token) return;
    
        const fetchAnalysisData = async () => {
            try {
                const response = await apiClient.get(`/analysis/result/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
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

    // SectionData를 ChecklistItem 형식으로 변환하는 함수
    const convertToChecklistFormat = (
        data: Record<string, Record<string, SectionData>> | undefined
    ): Record<string, Record<string, ChecklistItem>> => {
        if (!data) return {};
        
        const result: Record<string, Record<string, ChecklistItem>> = {};
        
        Object.entries(data).forEach(([category, items]) => {
            result[category] = {};
            
            Object.entries(items).forEach(([key, item]) => {
                result[category][key] = {
                    title: key, // 키를 title로 사용
                    status: item.status,
                    content: item.content || '',
                    boundingBox: item.boundingBox || [],
                    _id: item._id
                };
            });
        });
        
        return result;
    };

    // 모든 데이터를 결합하여 ChecklistItem 형식으로 변환
    const checklistData = convertToChecklistFormat({
        ...(analysisData?.기본계약정보 && { '기본계약정보': analysisData.기본계약정보 }),
        ...(analysisData?.보증금및월세조건 && { '보증금및월세조건': analysisData.보증금및월세조건 }),
        ...(analysisData?.관리비및공과금부담명확화 && { '관리비및공과금부담명확화': analysisData.관리비및공과금부담명확화 }),
        ...(analysisData?.시설및수리책임조항 && { '시설및수리책임조항': analysisData.시설및수리책임조항 }),
        ...(analysisData?.전세계약시추가확인사항 && { '전세계약시추가확인사항': analysisData.전세계약시추가확인사항 }),
        ...(analysisData?.반전세계약시추가확인사항 && { '반전세계약시추가확인사항': analysisData.반전세계약시추가확인사항 }),
        ...(analysisData?.계약해지및갱신조건명시 && { '계약해지및갱신조건명시': analysisData.계약해지및갱신조건명시 }),
        ...(analysisData?.특약사항명시 && { '특약사항명시': analysisData.특약사항명시 }),
    });

    console.log(analysisData?.image)
    
    const renderTabContent = () => {
        const components = {
            '전체 분석 내용': (
                <div className={styles.fullAnalysis}>
                    <ContractChecklist checklist={checklistData} onHighlight={handleHighlight} />
                    <RiskFactors riskFactors={analysisData?.위험요인 || null} />
                    <MissingFactors missingFactors={analysisData?.누락요소 || null} />
                </div>
            ),
            '계약서 체크리스트': <ContractChecklist checklist={checklistData} onHighlight={handleHighlight} />,
            '위험 요인': <RiskFactors riskFactors={analysisData?.위험요인 || null} />,
            '누락 요인': <MissingFactors missingFactors={analysisData?.누락요소 || null} />
        };

        return components[activeTab as keyof typeof components] || null;
    };
    
    const downloadPDF = async () => {
        const input = document.getElementById('analysis-result'); // PDF로 변환할 영역
    
        if (!input) {
            console.error("PDF로 변환할 요소를 찾을 수 없습니다.");
            return;
        }
    
        // 모든 이미지가 로드될 때까지 대기
        const images = input.getElementsByTagName('img');
        await Promise.all(
            Array.from(images).map((img) => {
                return new Promise((resolve, reject) => {
                    if (img.complete) {
                        resolve(true);
                    } else {
                        img.onload = () => resolve(true);
                        img.onerror = () => reject(new Error("이미지 로드 실패"));
                    }
                });
            })
        );

        try {
            const canvas = await html2canvas(input, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4'); // A4 사이즈 PDF

            const imgWidth = 210; // A4 너비(mm)
            const imgHeight = (canvas.height * imgWidth) / canvas.width; // 비율 유지

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save('analysis_result.pdf'); // PDF 저장
        } catch (error) {
            console.error('PDF 변환 중 오류 발생:', error);
        }
    };

    const baseURL = 'http://localhost:3000';

    const handleHighlight = (boundingBox: BoundingBox[] | null) => {
        setHighlightedBox(boundingBox);
    };

    const renderBoundingBoxes = () => {
        if (!highlightedBox || highlightedBox.length === 0 || !imageRef.current || !analysisData) return null;
    
        const imgElement = imageRef.current;
        const scaleX = imgElement.clientWidth / imgElement.naturalWidth;
        const scaleY = imgElement.clientHeight / imgElement.naturalHeight;
    
        const minX = Math.min(...highlightedBox.map(box => box.x)) * scaleX;
        const minY = Math.min(...highlightedBox.map(box => box.y)) * scaleY;
        const maxX = Math.max(...highlightedBox.map(box => box.x)) * scaleX;
        const maxY = Math.max(...highlightedBox.map(box => box.y)) * scaleY;
    
        const width = maxX - minX;
        const height = maxY - minY;
    
        return (
            <div
                className={styles.highlightBox}
                style={{
                    left: `${minX}px`,
                    top: `${minY}px`,
                    width: `${width}px`,
                    height: `${height}px`,
                    position: 'absolute',
                    border: '2px solid rgba(255, 0, 0, 0.7)',
                    borderRadius: '12px',
                    boxShadow: '0 0 8px rgba(255, 0, 0, 0.5)',
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    pointerEvents: 'none',
                }}
            />
        );
    };
    
    const handleChatButtonClick = async () => {
        console.log('Chat button clicked');
        if (!id) {
            console.error('No analysis ID found');
            return;
        }
        if (!token) {
            console.error('No token found');
            return;
        }
        try {
            console.log('Creating chat room with analysisId:', id);
            // 채팅방 생성 API 호출
            const response = await apiClient.post(`/chat-rooms/${id}`);
            console.log('Chat room creation response:', response.data);
            const chatRoomId = response.data._id;
            
            // 생성된 채팅방으로 이동
            router.push(`/chatroom/${chatRoomId}`);
        } catch (error) {
            console.error('채팅방 생성 중 오류 발생:', error);
            alert('채팅방 생성에 실패했습니다.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.logo}>
                <Image
                    src="/images/Renalyze_Introduce.svg"
                    alt="Contract Document"
                    width={1920}
                    height={95}
                    layout="responsive"
                    unoptimized={true}
                />
            </div>
            <div id="analysis-result">
                <div className={styles.title}>분석 결과</div>
                <div className={styles.analysisContainer}>
                    <div className={styles.leftPanel}>
                        {analysisData?.image ? (
                            <div className={styles.imageContainer}>
                                <img
                                    ref={imageRef}
                                    src={`${baseURL}${analysisData.image}`}
                                    alt="계약서 이미지"
                                    className={styles.contractImage}
                                />
                                {renderBoundingBoxes()}
                            </div>
                        ) : (
                            <p>업로드된 계약서가 여기에 표시됩니다.</p>
                        )}
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
                            <button className={styles.downloadButton} onClick={downloadPDF}>분석 결과 다운로드</button>
                            <button className={styles.chatbotButton} onClick={handleChatButtonClick}>AI 챗봇 상담</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisResultMain;