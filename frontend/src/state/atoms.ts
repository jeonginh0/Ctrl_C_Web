import { atom } from 'recoil';

export const uploadedFileState = atom<File | null>({
    key: 'uploadedFileState',
    default: null,
});

export const previewState = atom<{ type: 'image' | 'pdf'; url: string } | null>({
    key: 'previewState',
    default: null,
});
