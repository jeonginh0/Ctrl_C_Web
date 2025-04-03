import React, { useState } from 'react';
import styles from '@/styles/ContractChecklist.module.css';

// ChecklistItem 타입 정의
export type ChecklistItem = {
    title: string;
    status: boolean;
    content: string;
    boundingBox: Array<{ x: number; y: number }>;
    _id: string;
};

// ContractChecklist 컴포넌트의 Props 타입 정의
export type ContractChecklistProps = {
    checklist: Record<string, Record<string, ChecklistItem>>;
    onHighlight: (boundingBox: Array<{ x: number; y: number }> | null) => void;
};

// 카테고리 이름을 한글로 변환하는 매핑
const categoryNameMapping: Record<string, string> = {
    '기본계약정보': '기본 계약 정보',
    '보증금및월세조건': '보증금 및 월세 조건',
    '관리비및공과금부담명확화': '관리비 및 공과금 부담 명확화',
    '시설및수리책임조항': '시설 및 수리 책임 조항',
    '전세계약시추가확인사항': '전세 계약시 추가 확인사항',
    '반전세계약시추가확인사항': '반전세 계약시 추가 확인사항',
    '계약해지및갱신조건명시': '계약 해지 및 갱신 조건 명시',
    '특약사항명시': '특약 사항 명시'
};

const ContractChecklist: React.FC<ContractChecklistProps> = ({ checklist, onHighlight }) => {
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    
    // 카테고리 토글 함수
    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };
    
    // 카테고리 상태 계산 (모든 항목이 참이면 카테고리도 참)
    const getCategoryStatus = (items: Record<string, ChecklistItem>): boolean => {
        return Object.values(items).every(item => item.status);
    };

    // 카테고리 순서 정의
    const categoryOrder = [
        '기본계약정보', 
        '보증금및월세조건', 
        '관리비및공과금부담명확화',
        '시설및수리책임조항',
        '전세계약시추가확인사항',
        '반전세계약시추가확인사항',
        '계약해지및갱신조건명시',
        '특약사항명시',
    ];

    const handleItemClick = (item: ChecklistItem) => {
        onHighlight(item.boundingBox);
        setSelectedItemId(item._id);
    
        const imageContainer = document.getElementById('image-container');
        if (imageContainer && item.boundingBox.length > 0) {
            const minY = Math.min(...item.boundingBox.map(box => box.y));
            imageContainer.scrollTo({
                top: minY - 50,
                behavior: 'smooth',
            });
        }
    };

    // 존재하는 카테고리만 필터링하고 순서대로 정렬
    const orderedCategories = categoryOrder
        .filter(category => category in checklist)
        .map(category => ({
            key: category,
            displayName: categoryNameMapping[category] || category,
            items: checklist[category],
            status: getCategoryStatus(checklist[category])
        }));
    return (
        <div className={styles.mainContent}>
            <h1 className={styles.title}>
                계약서 체크리스트 <span className={styles.subtitle}>Contract Check-List</span>
            </h1>
            <div className={styles.divider}></div>

            <div className={styles.categoriesGrid}>
                {orderedCategories.map((category) => (
                    <div key={category.key} className={styles.categorySection}>
                        <div 
                            className={styles.categoryHeader} 
                            onClick={() => toggleCategory(category.key)}
                        >
                            <img 
                                src={category.status ? "/icons/CheckBox.svg" : "/icons/Xbox.svg"} 
                                alt={category.status ? "체크됨" : "미체크"}
                                className={styles.statusIcon}
                            />
                            <span className={styles.categoryName}>{category.displayName}</span>
                            <img 
                                src={expandedCategories[category.key] ? "/icons/Arrow-Up.svg" : "/icons/Arrow-Down.svg"} 
                                alt={expandedCategories[category.key] ? "접기" : "펼치기"}
                                className={styles.toggleIcon}
                            />
                        </div>
                    
                        {expandedCategories[category.key] && (
                            <div className={styles.itemsContainer}>
                                {Object.entries(category.items).map(([key, item]) => (
                                    <div
                                        key={key}
                                        className={styles.checklistItem}
                                        onClick={() => handleItemClick(item)}
                                    >
                                        <img 
                                            src={item.status ? "/icons/CheckBox.svg" : "/icons/Xbox.svg"} 
                                            alt={item.status ? "체크됨" : "미체크"}
                                            className={styles.itemStatus}
                                        />
                                        <span 
                                            className={`${styles.itemText} ${item.status ? styles.clickable : styles.disabled}`} 
                                            onClick={item.status ? () => handleItemClick(item) : undefined} 
                                        >
                                            {item.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContractChecklist;