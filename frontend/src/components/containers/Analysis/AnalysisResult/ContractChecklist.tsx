import React, {useState, useEffect} from 'react';
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
                style={{ backgroundImage: `url('/icons/${isOpen ? "Arrow-Up.svg" : "Arrow-Down.svg"}')` }}
              />
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
    const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
    const [apiData, setApiData] = useState<ChecklistItem[]>([]); // API 데이터 상태 추가
    const [loading, setLoading] = useState(true); // 로딩 상태 추가
    const [error, setError] = useState<string | null>(null); // 에러 처리 상태

    const checklistTitles = [
        '기본 계약 정보',
        '보증금 및 월세 조건',
        '관리비 및 공과금 부담 명확화',
        '시설 및 수리 책임 조항',
        '전세 계약 시 추가 확인 사항',
        '반전세(준전세) 계약 시 추가 확인 사항',
        '계약 해지 및 갱신 조건 명시',
        '특약 사항 명시 (계약서에 추가 기재)',
    ];
    
    // useEffect(() => {
    //     // checklist.sections의 타입을 명확하게 지정
    //     if (checklist?.sections) {
    //         const sectionsData: ChecklistItem[] = Object.entries(checklist.sections).map(([key, value]) => {
    //             // value의 타입을 ChecklistItem으로 명시
    //             const section = value as ChecklistItem;  // value를 ChecklistItem 타입으로 강제 변환
    //             return {
    //                 title: key,
    //                 status: section.status,
    //                 items: section.items?.map((item: { status: 'true' | 'false'; text: string }) => ({
    //                     status: item.status,
    //                     text: item.text
    //                 }))
    //             };
    //         });
    
    //         setApiData(sectionsData);
    //         setLoading(false);
    //     } else {
    //         setError('데이터 로딩에 실패했습니다.');
    //         setLoading(false);
    //     }
    // }, [checklist]);

    useEffect(() => {
        if (checklist?.sections) {
            const initialState: { [key: string]: boolean } = {};
            Object.keys(checklist.sections).forEach((key) => {
                initialState[key] = false;  // 기본값을 false로 설정
            });
            setOpenSections(initialState);
        }
    }, [checklist]); // checklist가 변경될 때마다 실행

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
                { status: 'true', text: '계약서 상 임대인 정보 확인' },
                { status: 'true', text: '계약서 상 임차인 정보 확인' },
                { status: 'true', text: '계약 기간 명시' },
                { status: 'true', text: '계약 대상(주택 주소, 면적) 명확하게 기재' },
            ]
        },
        {
            title: '보증금 및 월세 조건',
            status: 'false',
            items: [
                { status: 'false', text: '보증금 및 월세 명시 (금액 숫자 정확히 기입)' },
                { status: 'true', text: '월세 납부 방법 명시 (계좌이체/현금 납부 방식)' },
                { status: 'true', text: '연체 시 연체이자율 기재 (법정 최고이자율 초과 금지)' },
            ]
        },
        {
            title: '관리비 및 공과금 부담 명확화',
            status: 'true',
            items: [
                { status: 'true', text: '관리비 포함 항목 확인 (수도, 전기, 가스, 인터넷 등)' },
                { status: 'true', text: '개별 부담 항목(난방비, 주차비 등) 확인' },
            ]
        },
        {
            title: '시설 및 수리 책임 조항',
            status: 'true',
            items: [
                { status: 'true', text: '기본 시설물(도배, 장판, 가전 등) 유지·보수 책임 명확화' },
                { status: 'true', text: '계약 종료 시 원상복구 의무 여부 확인' },
            ]
        },
        {
            title: '전세 계약 시 추가 확인 사항',
            status: 'true',
            items: [
                { status: 'true', text: '전세보증보험 가입 가능 여부 확인' },
                { status: 'true', text: '보증금 반환 기한 및 방식 명시' },
            ]
        },
        {
            title: '반전세(준전세) 계약 시 추가 확인 사항',
            status: 'false',
            items: [
                { status: 'false', text: '보증금과 월세 비율 조정 가능 여부 확인' },
                { status: 'false', text: '보증금 반환 조건 및 월세 변동 가능성 기재' },
            ]
        },
        {
            title: '계약 해지 및 갱신 조건 명시',
            status: 'true',
            items: [
                { status: 'true', text: '중도 해지 시 위약금 여부' },
                { status: 'true', text: '계약 갱신 가능 여부 및 조건 명시' },
                { status: 'true', text: '임대인의 중도 해지 가능 여부 (매매 시 계약 승계 여부 포함)' },
            ]
        },
        {
            title: '특약 사항 명시 (계약서에 추가 기재)',
            status: 'true',
            items: [
                { status: 'true', text: '도배, 장판 등 집 원상복구 여부' },
                { status: 'true', text: '옵션 가구 및 가전제품 유지보수 책임자' },
                { status: 'true', text: '임대인의 방문 가능 여부 및 사전 통보 조건' },
                { status: 'true', text: '건물 매각 시 임차인 보호 조항 포함' },
            ]
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
