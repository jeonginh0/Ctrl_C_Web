import React, { ChangeEvent, DragEvent } from 'react';
import styles from '@/styles/AnalysisMain.module.css';
import SuccessMessage from '@/components/common/messages/SuccessMessage';

type FileUploadSectionProps = {
    preview: { type: 'image' | 'pdf'; url: string } | null;
    setPreview: (preview: { type: 'image' | 'pdf'; url: string } | null) => void;
    file: File | null;
    setFile: (file: File | null) => void;
    error: string;
    uploadSuccess: boolean;
    uploading: boolean;
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleDragOver: (e: DragEvent<HTMLDivElement>) => void;
    handleDragLeave: (e: DragEvent<HTMLDivElement>) => void;
    handleDrop: (e: DragEvent<HTMLDivElement>) => void;
    handleUpload: () => Promise<void>;
    triggerFileInput: () => void;
};

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
    preview,
    setPreview,
    file,
    setFile,
    error,
    uploadSuccess,
    uploading,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleUpload
}) => {
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

            {error && <p className={styles.error}>{error}</p>}
            {uploadSuccess && <SuccessMessage message={'파일이 정상적으로 업로드 되었습니다. 분석결과를 기다려주세요.'}/>}
        </div>
    );
};

export default FileUploadSection;
