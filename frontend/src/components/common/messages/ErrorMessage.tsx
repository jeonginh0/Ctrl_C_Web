import React from 'react';
import styles from '@/styles/Message.module.css';

interface ErrorMessageProps {
    message: string;
};

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    return <p className={styles.error}>{message}</p>;
};

export default ErrorMessage;