'use client';

import { useState, useRef, useEffect, ChangeEvent, DragEvent } from 'react';
import Button from "@/components/common/inputs/Button";
import buttons from "@/styles/Button.module.css";
import FileUploadSection from './FileUploadSection';
import styles from '@/styles/AnalysisMain.module.css';
import ImageWrapper from '@/components/common/inputs/ImageWrapper';
import apiClient from '@/ApiClient';

export default function AnalysisMain() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<{ type: 'image' | 'pdf'; url: string } | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isClient, setIsClient] = useState(false);

    const handleFileSelect = (selectedFile: File) => {
        const fileType = selectedFile.type;
        if (!['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(fileType)) {
            setError('PDF, JPG, PNG, JPEG 파일만 업로드 가능합니다.');
            return;
        }

        setError('');
        setUploadSuccess(false);
        setFile(selectedFile);

        if (fileType.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreview({ type: 'image', url: reader.result as string });
            };
            reader.readAsDataURL(selectedFile);
        } else if (fileType === 'application/pdf') {
            setPreview({ type: 'pdf', url: URL.createObjectURL(selectedFile) });
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            handleFileSelect(selectedFile);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add(styles.dragover);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove(styles.dragover);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove(styles.dragover);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setError('분석할 파일을 선택해주세요.');
            return;
        }
    
        try {
            setUploading(true);
    
            const formData = new FormData();
            
            const requestJson = {
                images: [{ format: file.type.split('/')[1], name: 'contract' }],
                requestId: crypto.randomUUID(),
                version: 'V2',
                timestamp: Date.now(),
            };
    
            formData.append('message', JSON.stringify(requestJson));
    
            formData.append('file', file);
    
            const response = await apiClient.post('/ocr/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            console.log('OCR 결과:', response.data);

            const saveResponse = await apiClient.post('/analysis/save', {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            console.log('분석 저장 결과:', saveResponse.data);
            setUploadSuccess(true);
        } catch (error) {
            console.error('OCR 분석 실패:', error);
            setError('파일 분석 중 오류가 발생했습니다.');
        } finally {
            setUploading(false);
        }
    };    

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        } else {
            console.error("파일 입력 요소를 찾을 수 없습니다.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.logo}>
                <ImageWrapper src="/images/Sub_Header.svg" alt="Contract Document" width={1920} height={95} />
            </div>

            <main className={styles.main}>
                <div className={styles.textSection}>
                    <h1 className={styles.title}>분석할 계약서를 업로드 하세요</h1>
                    <p className={styles.description}>PDF, JPG, PNG, JPEG 등 다양한 확장자 업로드 가능</p>
                    <Button className={buttons.browseButton} onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>파일 업로드</Button>
                </div>

                <FileUploadSection
                    preview={preview}
                    file={file}
                    error={error}
                    uploadSuccess={uploadSuccess}
                    uploading={uploading}
                    setPreview={setPreview}
                    setFile={setFile}      
                    handleFileChange={handleFileChange}
                    handleDragOver={handleDragOver}
                    handleDragLeave={handleDragLeave}
                    handleDrop={handleDrop}
                    handleUpload={handleSubmit}
                    triggerFileInput={triggerFileInput}
                />
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    style={{ display: 'none' }} 
                    accept=".pdf,.jpg,.jpeg,.png" 
                />
            </main>

            <div className={styles.actionSection}>
                <Button className={buttons.uploadButton} onClick={handleSubmit} disabled={!file || uploading}>
                    {uploading ? '업로드 중...' : '파일 분석하기'}
                </Button>
            </div>
        </div>
    );
}
