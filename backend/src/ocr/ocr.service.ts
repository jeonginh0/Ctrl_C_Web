import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OcrResult } from './entity/ocr-result.schema';

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
            const format = this.getFileFormat(fileType); // 파일 타입 매핑
    
            const response = await axios.post(
                this.OCR_API_URL,
                { images: [{ format, data: imageBuffer.toString('base64') }] },
                {
                    headers: {
                        'X-OCR-SECRET': this.OCR_SECRET,
                        'Content-Type': 'application/json',
                    },
                },
            );
    
            if (!response.data?.images || response.data.images.length === 0) {
                throw new InternalServerErrorException('OCR API 응답이 올바르지 않습니다.');
            }
    
            const extractedData = response.data.images[0].fields?.map(field => ({
                text: field.inferText,
                boundingBox: field.boundingPoly.vertices,
            })) || [];
    
            const savedResult = await new this.ocrModel({ data: extractedData }).save();
    
            return savedResult;
        } catch (error) {
            console.error('OCR 분석 실패:', error.message);
            throw new InternalServerErrorException('OCR 분석 중 오류가 발생했습니다.');
        }
    }
    
    private getFileFormat(fileType: string): string {
        const mimeTypeMap: { [key: string]: string } = {
            'image/jpeg': 'jpeg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'application/pdf': 'pdf',
        };
    
        return mimeTypeMap[fileType] || 'jpg'; // 기본값은 'jpg'
    }
}
