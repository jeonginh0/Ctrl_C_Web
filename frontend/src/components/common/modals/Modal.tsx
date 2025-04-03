import React from 'react';
import styles from '@/styles/Modal.module.css';

const Modal = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>{children}</div>
        </div>
    );
};

export default Modal;