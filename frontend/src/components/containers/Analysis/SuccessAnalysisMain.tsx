'use client';

import React, { useState, useEffect } from 'react';
import FileUploadSection from '@/components/containers/Analysis/FileUploadSection';
import styles from '@/styles/SuccessAnalysisMain.module.css';
import ImageWrapper from '@/components/common/inputs/ImageWrapper';
import apiClient from '@/ApiClient';

export default function SuccessAnalysisMain() {
    const [preview, setPreview] = useState<{ type: 'image' | 'pdf'; url: string } | null>(null);

    return (
        <div className={styles.container}>
            <div className={styles.logo}>
                <ImageWrapper src="/images/Sub_Header.svg" alt="Contract Document" width={1920} height={95} />
            </div>
        </div>
    );
}
