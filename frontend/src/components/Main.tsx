"use client"

import Image from 'next/image'
import { useState } from 'react'
import styles from '@/styles/Main.module.css'

export default function Main() {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  
  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };
  
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <Image 
              src="/images/Main_Introduce.png" 
              alt="Contract Document" 
              width={1920} 
              height={95} 
          />
        </div>
      </section>

      <section className={styles.featureSection}>
        <div className={styles.featureContent}>
          <div className={styles.featureText}>
            <h2 className={styles.featureTitle}>
              이제 계약서 분석도<br />
              자동으로
            </h2>
            <p className={styles.featureDescription}>
              계약서 요약 및 정리, 위험요소 & 누락요소 검토 등<br />
              여러 기능을 제공합니다
            </p>
            <button className={styles.analyzeButton}>분석하기</button>
          </div>
          <div className={styles.featureImage}>
            <Image 
              src="/images/Main_Contract_Image1.png" 
              alt="Contract Document" 
              width={600} 
              height={600} 
            />
          </div>
        </div>
      </section>

      <section className={styles.infoSection}>
        <div className={styles.infoContainer}>
          <div className={styles.dashboardImage}>
            <Image 
              src="/images/Main_Image2.png" 
              alt="Dashboard" 
              width={600} 
              height={600} 
            />
          </div>
          <div className={styles.serviceInfo}>
            <h2 className={styles.serviceTitle}>CTRL+C AI</h2>
            
            <div className={styles.accordionContainer}>
              <div 
                className={`${styles.accordionItem} ${openAccordion === 'summary' ? styles.open : ''}`}
                onClick={() => toggleAccordion('summary')}
              >
                <div className={styles.accordionHeader}>
                  <Image src="/images/Main_service1.png" alt="Document Icon" width={39} height={39} />
                  <h3>계약서 요약 및 정리</h3>
                  <span className={styles.accordionArrow}>{openAccordion === 'summary' ? '▲' : '▼'}</span>
                </div>
                {openAccordion === 'summary' && (
                  <div className={styles.accordionContent}>
                    <p>업로드한 계약서를 AI가 분석하여 주요 내용을 정리합니다.</p>
                  </div>
                )}
              </div>
              
              <div 
                className={`${styles.accordionItem} ${openAccordion === 'risk' ? styles.open : ''}`}
                onClick={() => toggleAccordion('risk')}
              >
                <div className={styles.accordionHeader}>
                  <Image src="/images/Main_service2.png" alt="Risk Icon" width={39} height={39} />
                  <h3>위험요소·누락요소 검토</h3>
                  <span className={styles.accordionArrow}>{openAccordion === 'risk' ? '▲' : '▼'}</span>
                </div>
                {openAccordion === 'risk' && (
                  <div className={styles.accordionContent}>
                    <p>계약서를 분석하여 위험요소와 누락요소를 검토합니다.</p>
                  </div>
                )}
              </div>
              
              <div 
                className={`${styles.accordionItem} ${openAccordion === 'compare' ? styles.open : ''}`}
                onClick={() => toggleAccordion('compare')}
              >
                <div className={styles.accordionHeader}>
                  <Image src="/images/Main_service3.png" alt="Compare Icon" width={39} height={39} />
                  <h3>위험도 평가</h3>
                  <span className={styles.accordionArrow}>{openAccordion === 'compare' ? '▲' : '▼'}</span>
                </div>
                {openAccordion === 'compare' && (
                  <div className={styles.accordionContent}>
                    <p>계약서의 각 항목별 위험도를 측정하여 그래프로 나타냅니다.</p>
                  </div>
                )}
              </div>
              
              <div 
                className={`${styles.accordionItem} ${openAccordion === 'download' ? styles.open : ''}`}
                onClick={() => toggleAccordion('download')}
              >
                <div className={styles.accordionHeader}>
                  <Image src="/images/Main_service4.png" alt="Download Icon" width={39} height={39} />
                  <h3>분석 결과 다운로드</h3>
                  <span className={styles.accordionArrow}>{openAccordion === 'download' ? '▲' : '▼'}</span>
                </div>
                {openAccordion === 'download' && (
                  <div className={styles.accordionContent}>
                    <p>계약서 분석 결과를 PDF 형식으로 다운로드 할 수 있습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}