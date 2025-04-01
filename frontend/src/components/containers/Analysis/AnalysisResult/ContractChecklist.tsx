import React, {useState, useEffect} from 'react';
import styles from '@/styles/ContractChecklist.module.css'

type ChecklistItem = {
    title: string;
    status: boolean; // 'true' | 'false' → boolean 타입으로 수정
    items?: Array<{
        status: boolean; // 'true' | 'false' → boolean 타입으로 수정
        content: string;
        boundingBox: Array<{ x: number; y: number }>; // boundingBox 타입 정의
    }>;
};

// API에서 반환된 데이터 타입 정의
type ContractChecklistProps = {
    checklist: Record<string, any>;
};

// 체크리스트 섹션 컴포넌트
const ChecklistSection: React.FC<{ item: ChecklistItem; isOpen: boolean; toggle: () => void; id: string }> = ({ item, isOpen, toggle, id }) => {
    return (
        <div className={styles.section} id={id}>
            <div className={styles.sectionHeader} onClick={toggle}>
                <div className={styles.sectionTitle}>
                    <div className={`${styles.statusIcon} ${item.status ? styles.true : styles.false}`} />
                    {item.title}
                </div>
                <div
                    className={styles.dropdownIcon}
                    style={{ backgroundImage: `url('/icons/${isOpen ? 'Arrow-Up.svg' : 'Arrow-Down.svg'}')` }}
                />
            </div>
            {item.items && isOpen && (
                <div className={styles.sectionItems}>
                    {item.items.map((subItem, index) => (
                        <div className={styles.checklistItem} key={index}>
                            <div className={`${styles.smallCheckIcon} ${subItem.status ? styles.true : styles.false}`} />
                            <span className={styles.detailText}>{subItem.content}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ContractChecklist: React.FC<ContractChecklistProps> = ({ checklist }) => {
    const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
    const [apiData, setApiData] = useState<ChecklistItem[]>([]); // API 데이터 상태 추가
    const [loading, setLoading] = useState(true); // 로딩 상태 추가
    const [error, setError] = useState<string | null>(null); // 에러 처리 상태
    
    useEffect(() => {
        if (checklist?.sections) {
            const sectionsData: ChecklistItem[] = Object.entries(checklist.sections).map(([key, value]) => {
                const section = value as ChecklistItem;
                return {
                    title: key,
                    status: section.status, // boolean 처리
                    items: section.items?.map((item) => ({
                        status: item.status, // boolean 처리
                        content: item.content,
                        boundingBox: item.boundingBox || [], // boundingBox 배열 처리
                    }))
                };
            });
            
            console.log(apiData);
            setApiData(sectionsData);
            setLoading(false);
        } else {
            setError('데이터 로딩에 실패했습니다.');
            setLoading(false);
        }
    }, [checklist]);

    const toggleSection = (sectionId: string) => {
        setOpenSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className={styles.mainContent}>
            <h1 className={styles.title}>
                계약서 체크리스트 <span className={styles.subtitle}>Contract Check-List</span>
            </h1>
            <div className={styles.checklistContainer}>
                {apiData.map((item, index) => (
                    <ChecklistSection 
                        key={index} 
                        item={item} 
                        isOpen={openSections[item.title] || false} 
                        toggle={() => toggleSection(item.title)} 
                        id={item.title} 
                    />
                ))}
            </div>
        </div>
    );
};

export default ContractChecklist;