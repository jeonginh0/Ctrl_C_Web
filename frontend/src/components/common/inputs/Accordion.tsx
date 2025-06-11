import React from "react";
import Image from "next/image";
import UpIcon from "../../../../public/icons/UpIcon.svg";
import DownIcon from "../../../../public/icons/DownIcon.svg";
import styles from "@/styles/Accordion.module.css";

type AccordionProps = {
  id: string;
  title: string;
  content: string;
  iconSrc: string;
  isOpen: boolean;  // 부모에서 전달받을 상태
  toggleAccordion: (id: string) => void;  // 부모에서 전달받을 상태 변경 함수
};

const Accordion: React.FC<AccordionProps> = ({ id, title, content, iconSrc, isOpen, toggleAccordion }) => {
  return (
    <div
      className={`${styles.accordionItem} ${isOpen ? styles.open : ""}`}
      onClick={() => toggleAccordion(id)}  // 클릭 시 부모에서 전달된 toggleAccordion 호출
    >
      <div className={styles.accordionHeader}>
        <Image src={iconSrc} alt="Icon" width={39} height={39} />
        <h3>{title}</h3>
        <Image src={isOpen ? UpIcon : DownIcon} alt="Accordion Icon" width={20} height={20} />
      </div>
      {isOpen && <div className={styles.accordionContent}><p>{content}</p></div>}
    </div>
  );
};

export default Accordion;
