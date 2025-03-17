import React from 'react';
import styles from '@/styles/Message.module.css';

interface SuccessMessageProps {
    message: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ message }) => {
    return <p className={styles.success}>{message}</p>;
};

export default SuccessMessage;