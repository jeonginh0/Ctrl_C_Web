import React from "react";
import styles from "@/styles/Button.module.css";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset"; // Add type prop with default value 'button'
};

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button", // Default to 'button' type
}) => {
  return (
    <button
      type={type} // Apply the type prop to the button element
      className={`${styles.button} ${className}`}
      onClick={(e) => {
        if (onClick) onClick(e);
      }}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;