import React from "react";
import styles from "@/styles/Button.module.css";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // 이벤트 객체를 받도록 수정
  className?: string;
  disabled?: boolean; // disabled 속성 추가
};

const Button: React.FC<ButtonProps> = ({ children, onClick, className = "", disabled = false }) => {
  return (
    <button
      className={`${styles.button} ${className}`}
      onClick={(e) => {
        if (onClick) onClick(e); // 이벤트 객체를 전달하여 onClick 처리
      }}
      disabled={disabled} // disabled 속성 적용
    >
      {children}
    </button>
  );
};

export default Button;
