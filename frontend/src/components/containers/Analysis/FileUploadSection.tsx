import React, { useState, ChangeEvent, DragEvent } from 'react';
import styles from '@/styles/AnalysisMain.module.css';
import apiClient from '@/ApiClient';

type FileUploadSectionProps = {
    preview: { type: 'image' | 'pdf'; url: string } | null;
    setPreview: (preview: { type: 'image' | 'pdf'; url: string } | null) => void;
    file: File | null;
    setFile: (file: File | null) => void;
    error: string;
    uploading: boolean;
};

const FileUploadSection: React.FC<FileUploadSectionProps> = ({ preview, setPreview, file, setFile }) => {
    const [error, setError] = useState<string>('');
    const [uploading, setUploading] = useState<boolean>(false);
    const [ocrResult, setOcrResult] = useState<any>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) processFile(selectedFile);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };
    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) processFile(droppedFile);
    };

    const processFile = (selectedFile: File) => {
        setFile(selectedFile);
        setError('');

        const fileType = selectedFile.type.startsWith('image') ? 'image' : 'pdf';
        const url = URL.createObjectURL(selectedFile);
        setPreview({ type: fileType, url });
    };

    const handleUpload = async () => {
        if (!file) {
            setError('파일을 선택하세요.');
            return;
        }
    
        setUploading(true);
        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                
                const response = await apiClient.post('/ocr/upload', {
                    base64Image: base64String,
                });
    
                setOcrResult(response.data);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error("OCR 요청 실패:", error);
            setError("OCR 요청 중 오류가 발생했습니다.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.uploadSection}>
            <div
                className={styles.uploadArea}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
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
                <input type="file" onChange={handleFileChange} className={styles.fileInput} accept=".pdf,.jpg,.jpeg,.png" />
            </div>
            
            <button onClick={handleUpload} disabled={uploading} className={styles.uploadButton}>
                {uploading ? "분석 중..." : "OCR 분석 요청"}
            </button>

            {error && <p className={styles.error}>{error}</p>}

            {ocrResult && (
                <div className={styles.resultContainer}>
                    <h3>OCR 분석 결과</h3>
                    <pre className={styles.resultText}>{JSON.stringify(ocrResult, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default FileUploadSection;
