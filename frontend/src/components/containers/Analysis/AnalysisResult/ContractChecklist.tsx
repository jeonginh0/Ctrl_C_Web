import React, {useState} from 'react';
import styles from '@/styles/ContractChecklist.module.css'

type ChecklistItem = {
    title: string;
    status: 'true' | 'false';
    items?: Array<{
        status: 'true' | 'false';
        text: string;
    }>;
  };

type ContractChecklistProps = {
    checklist: Record<string, any>;
};

// 체크리스트 섹션 컴포넌트
interface ChecklistSectionProps {
    item: ChecklistItem;
    isOpen: boolean;
    toggle: () => void;
    id: string;
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({ item, isOpen, toggle, id }) => {
  return (
    <div className={styles.section} id={id}>
        <div className={styles.sectionHeader} onClick={toggle}>
            <div className={styles.sectionTitle}>
                <div className={`${styles.statusIcon} ${item.status === 'true' ? styles.true : styles.false}`}>
                </div>
                {item.title}
                </div>
                <div 
                className={styles.dropdownIcon} 
                style={{ backgroundImage: `url('/icons/${isOpen ? "Arrow-Up.svg" : "Arrow-Down.svg"}')` }}>
            </div>
        </div>

        {item.items && isOpen && (
            <div className={styles.sectionItems}>
            {item.items.map((subItem, index) => (
                <div className={styles.checklistItem} key={index}>
                <div className={`${styles.smallCheckIcon} ${subItem.status === 'true' ? styles.true : styles.false}`}></div>
                <span className={styles.detailText}>{subItem.text}</span>
                </div>
            ))}
            </div>
        )}
    </div>
  );
};

const ContractChecklist: React.FC<ContractChecklistProps> = ({ checklist }) => {
    const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
        'basic-info': true,
        'signature': false,
        'special-terms': false,
        'facilities': false,
        'termination': false,
        'deposit': true,
        'maintenance': false,
    });

    const toggleSection = (sectionId: string) => {
        setOpenSections(prev => ({
          ...prev,
          [sectionId]: !prev[sectionId]
        }));
      };
    
    // 체크리스트 데이터
    const checklistData: ChecklistItem[] = [
        {
            title: '기본 계약 정보',
            status: 'true',
            items: [
                { status: 'true', text: '계약서 상 입대인(집주인) 및 임차인(세입자) 정보 확인' },
                { status: 'true', text: '계약 기간 명시' },
                { status: 'true', text: '계약 대상(주소, 면적) 명확하게 기재' },
            ]
        },
        {
            title: '서명 및 날인 필수',
            status: 'true',
        },
        {
            title: '특약 사항 명시',
            status: 'true',
        },
        {
            title: '시설 및 수리 책임 조항',
            status: 'true',
        },
        {
            title: '계약 해지 및 갱신 조건 명시',
            status: 'true',
        },
        {
            title: '보증금 및 월세 조건',
            status: 'false',
            items: [
                { status: 'false', text: '보증금 및 월세 명시 (금액 숫자 정확히 기입)' },
                { status: 'true', text: '계약 기간 명시' },
                { status: 'true', text: '계약 대상(주소, 면적) 명확하게 기재' },
            ]
        },
        {
            title: '관리비 및 공과금 부담 명확화',
            status: 'true',
        },
    ];

    return (
        <div>
            <div className={styles.mainContent}>
                <h1 className={styles.title}>
                    계약서 체크리스트 <span className={styles.subtitle}>Contract Check-List</span>
                </h1>

                <div className={styles.checklistContainer}>
                    <div className={styles.itemRow}>
                        <ChecklistSection 
                            item={checklistData[0]} 
                            isOpen={openSections['basic-info']} 
                            toggle={() => toggleSection('basic-info')}
                            id="basic-info"
                        />
                        <ChecklistSection 
                            item={checklistData[1]} 
                            isOpen={openSections['signature']} 
                            toggle={() => toggleSection('signature')}
                            id="signature"
                        />
                        <ChecklistSection 
                            item={checklistData[2]} 
                            isOpen={openSections['special-terms']} 
                            toggle={() => toggleSection('special-terms')}
                            id="special-terms"
                        />
                    </div>

                    <div className={styles.itemRow}>
                        <ChecklistSection 
                            item={checklistData[3]} 
                            isOpen={openSections['facilities']} 
                            toggle={() => toggleSection('facilities')}
                            id="facilities"
                        />
                        <ChecklistSection 
                            item={checklistData[4]} 
                            isOpen={openSections['termination']} 
                            toggle={() => toggleSection('termination')}
                            id="termination"
                        />

                        <ChecklistSection 
                            item={checklistData[5]} 
                            isOpen={openSections['deposit']} 
                            toggle={() => toggleSection('deposit')}
                            id="deposit"
                        />
                    </div>
                    <div className={styles.itemRow}>
                        <ChecklistSection 
                            item={checklistData[6]} 
                            isOpen={openSections['maintenance']} 
                            toggle={() => toggleSection('maintenance')}
                            id="maintenance"
                        />
                    </div>
                </div>
            </div>
            
            {/* <pre>{JSON.stringify(checklist, null, 2)}</pre> */}
        </div>
    );
};

export default ContractChecklist;
