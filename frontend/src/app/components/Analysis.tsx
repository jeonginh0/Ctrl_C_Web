'use client';

import { useState, useRef, ChangeEvent, DragEvent, FormEvent } from 'react';
import styles from '@/app/styles/Analysis.module.css';
import Head from 'next/head';
import Image from 'next/image';

export default function Analysis() {
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

            const response = await fetch('https://your-backend-api.com/api/analyze', {
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
            <Head>
                <title>계약서 분석 - CTRL+C AI</title>
            </Head>
            <div className={styles.logo}>
                <Image 
                    src="/images/Main_Introduce.png" 
                    alt="Contract Document" 
                    width={1920} 
                    height={95}
                />
            </div>

            <main className={styles.main}>
                <div className={styles.textSection}>
                    <h1 className={styles.title}>분석할 계약서를 업로드 하세요</h1>
                    <p className={styles.description}>PDF, JPG, PNG, JPEG 등 다양한 확장자 업로드 가능</p>
                    <button type="button" className={styles.browseButton} onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}>
                        파일 선택
                    </button>
                </div>

                <div className={styles.uploadSection}>
                    <form ref={formRef} onSubmit={handleSubmit}>
                        <div
                            className={styles.uploadArea}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={triggerFileInput}
                        >
                            {preview ? (
                                <div className={styles.previewContainer}>
                                    {preview.type === 'image' ? (
                                        <img src={preview.url} alt="업로드된 이미지" className={styles.previewImage} />
                                    ) : (
                                        <iframe src={preview.url} className={styles.previewPdf} title="PDF 미리보기"></iframe>
                                    )}
                                    <p className={styles.fileName}>{file?.name}</p>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.uploadIcon}>
                                        <img src="/images/Analysis_Image1.png" alt="업로드 아이콘" className={styles.iconImage} />
                                    </div>
                                    <p>업로드된 계약서가 이곳에 표시됩니다.</p>
                                </>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className={styles.fileInput} accept=".pdf,.jpg,.jpeg,.png" />
                        </div>

                        {error && <p className={styles.error}>{error}</p>}
                        {uploadSuccess && <p className={styles.success}>파일이 성공적으로 업로드되었습니다. 분석 결과를 기다려 주세요.</p>}
                    </form>
                </div>
            </main>

            <div className={styles.actionSection}>
                <button
                    type="button"  // 변경: submit을 button으로
                    className={styles.uploadButton}
                    onClick={(e) => formRef.current?.requestSubmit()}  // 폼의 submit을 강제로 실행
                    disabled={!file || uploading}
                >
                    {uploading ? '업로드 중...' : '파일 분석하기'}
                </button>
            </div>
        </div>
    );
}
