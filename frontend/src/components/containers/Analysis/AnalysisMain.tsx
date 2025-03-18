'use client';

import { useState, useRef, ChangeEvent, DragEvent, FormEvent } from 'react';
import Button from "@/components/common/inputs/Button";
import buttons from "@/styles/Button.module.css"
import FileUploadSection from './FileUploadSection';
import ErrorMessage from '@/components/common/messages/ErrorMessage';
import SuccessMessage from '@/components/common/messages/SuccessMessage';
import styles from '@/styles/AnalysisMain.module.css';
import ImageWrapper from '@/components/common/inputs/ImageWrapper';

export default function AnalysisMain() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<{ type: 'image' | 'pdf'; url: string } | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

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

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();  // 폼의 기본 동작을 막아야 페이지 리로드가 발생하지 않음

        if (!file) {
            setError('분석할 파일을 선택해주세요.');
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('https://localhost:3000/api/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('파일 업로드 중 오류가 발생했습니다.');
            }

            setUploadSuccess(true);
        } catch (err) {
            console.error('Upload error:', err);
            setError('파일 업로드 중 오류가 발생했습니다.');
        } finally {
            setUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
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
                    handleFileChange={handleFileChange}
                    handleDragOver={handleDragOver}
                    handleDragLeave={handleDragLeave}
                    handleDrop={handleDrop}
                    triggerFileInput={triggerFileInput}
                />

                {error && <ErrorMessage message={error} />}
                {uploadSuccess && <SuccessMessage message={'파일이 정상적으로 업로드 되었습니다. 분석결과를 기다려주세요.'}/>}
            </main>

            <div className={styles.actionSection}>
                <Button className={buttons.uploadButton} onClick={(e) => formRef.current?.requestSubmit()} disabled = {!file || uploading}>
                    {uploading ? '업로드 중...' : '파일 분석하기'}
                </Button>
            </div>
        </div>
    );
}
