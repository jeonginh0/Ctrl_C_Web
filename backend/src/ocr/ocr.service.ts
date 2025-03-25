import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OcrResult } from './entity/ocr-result.schema';
import { v4 as uuidv4 } from 'uuid';
import * as FormData from 'form-data';


@Injectable()
export class OcrService {
    private readonly OCR_API_URL: string;
    private readonly OCR_SECRET: string;

    constructor(
        private configService: ConfigService,
        @InjectModel(OcrResult.name) private ocrModel: Model<OcrResult>,
    ) {
        this.OCR_API_URL = this.configService.get<string>('OCR_API_URL') as string;
        this.OCR_SECRET = this.configService.get<string>('OCR_SECRET') as string;
    }

    async analyzeContract(imageBuffer: Buffer, fileType: string): Promise<any> {
        try {
            console.log('📌 파일 타입:', fileType);
            const format = this.getFileFormat(fileType);
            console.log('📌 변환된 파일 형식:', format);
    
            const requestJson = {
                images: [
                    {
                        format,
                        name: 'contract'
                    }
                ],
                requestId: uuidv4(),
                version: 'V2',
                timestamp: Date.now(),
            };
    
            const formData = new FormData();
            formData.append('message', JSON.stringify(requestJson));
            formData.append('file', imageBuffer, { filename: `upload.${format}`, contentType: fileType });
    
            const response = await axios.post(this.OCR_API_URL, formData, {
                headers: {
                    'X-OCR-SECRET': this.OCR_SECRET,
                    ...formData.getHeaders(),
                },
            });
    
            console.log('📌 OCR API 응답:', response.data);
    
            if (!response.data?.images || response.data.images.length === 0) {
                throw new InternalServerErrorException('OCR API 응답이 올바르지 않습니다.');
            }
    
            const extractedData = response.data.images[0].fields?.map(field => ({
                text: field.inferText,
                boundingBox: field.boundingPoly.vertices,
            })) || [];
    
            try {
                const savedResult = await new this.ocrModel({ data: extractedData }).save();
                console.log('📌 MongoDB 저장 성공:', savedResult);
                return savedResult;
            } catch (dbError) {
                console.error('📌 MongoDB 저장 실패:', dbError);
                throw new InternalServerErrorException('DB 저장 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('📌 OCR 분석 실패:', error.message);
            throw new InternalServerErrorException('OCR 분석 중 오류가 발생했습니다.');
        }
    }
    
    private getFileFormat(fileType: string): string {
        console.log('fileType:', fileType);
        const mimeTypeMap: { [key: string]: string } = {
            'image/jpeg': 'jpeg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'application/pdf': 'pdf',
        };
    
        return mimeTypeMap[fileType] || 'jpg'; // 기본값은 'jpg'
    }
}
