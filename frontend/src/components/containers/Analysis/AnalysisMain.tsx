'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import Button from "@/components/common/inputs/Button";
import buttons from "@/styles/Button.module.css";
import FileUploadSection from './FileUploadSection';
import ErrorMessage from '@/components/common/messages/ErrorMessage';
import SuccessMessage from '@/components/common/messages/SuccessMessage';
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
    
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
    
                try {
                    const response = await apiClient.post('/ocr/upload', { 
                        base64Image: base64String, 
                        fileType: file.type  // 📌 파일 타입 추가
                    });
    
                    console.log('OCR 결과:', response.data);
                    setUploadSuccess(true);
                } catch (error) {
                    console.error('OCR 분석 실패:', error);
                    setError('파일 분석 중 오류가 발생했습니다.');
                } finally {
                    setUploading(false);
                }
            };
    
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('OCR 분석 실패:', err);
            setError('파일 분석 중 오류가 발생했습니다.');
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

                {error && <ErrorMessage message={error} />}
                {uploadSuccess && <SuccessMessage message={'파일이 정상적으로 업로드 되었습니다. 분석결과를 기다려주세요.'}/>}                
            </main>

            <div className={styles.actionSection}>
                <Button className={buttons.uploadButton} onClick={handleSubmit} disabled={!file || uploading}>
                    {uploading ? '업로드 중...' : '파일 분석하기'}
                </Button>
            </div>
        </div>
    );
}
