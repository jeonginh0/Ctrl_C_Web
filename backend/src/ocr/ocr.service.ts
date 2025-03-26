import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OcrResult } from './entity/ocr-result.schema';
import { v4 as uuidv4 } from 'uuid';
import * as FormData from 'form-data';
import * as sharp from 'sharp';
import { Types } from 'mongoose';

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

    async analyzeContract(userId: string, imageBuffer: Buffer, fileType: string): Promise<any> {
        try {
            console.log('📌 파일 타입:', fileType);

            const processedImage = await this.processImage(imageBuffer, fileType);

            const format = this.getFileFormat(fileType);
            console.log('📌 변환된 파일 형식:', format);

            const requestJson = {
                images: [{ format, name: 'contract' }],
                requestId: uuidv4(),
                version: 'V2',
                timestamp: Date.now(),
            };

            const formData = new FormData();
            formData.append('message', JSON.stringify(requestJson));
            formData.append('file', processedImage, { filename: `upload.${format}`, contentType: fileType });

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

            const fields = response.data.images[0].fields || [];
            if (!fields.length) {
                throw new InternalServerErrorException('OCR 데이터가 없습니다.');
            }

            const groupedText = this.groupBySentence(fields);

            try {
                const savedResult = await new this.ocrModel({
                    userId: new Types.ObjectId(userId),
                    data: groupedText
                }).save();

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

    private groupBySentence(fields: any[]): { text: string; boundingBox: any[] }[] {
        const lines: { text: string; boundingBox: any[] }[] = [];
    
        fields.sort((a, b) => (a.boundingPoly?.vertices[0]?.y || 0) - (b.boundingPoly?.vertices[0]?.y || 0));
    
        let paragraph = "";
        let boundingBoxes: any[] = [];
        const splitKeywords = ["임대인", "임차인"];
        const numberPattern = /^\d+\./;
    
        for (const field of fields) {
            let text = field.inferText.trim();
            const bbox = field.boundingPoly?.vertices || [];
    
            if (splitKeywords.includes(text) || numberPattern.test(text)) {
                if (paragraph) {
                    lines.push({
                        text: paragraph,
                        boundingBox: this.getBoundingBox(boundingBoxes)
                    });
                }
                paragraph = text;
                boundingBoxes = [...bbox];
            } else {
                paragraph += (paragraph ? " " : "") + text;
                boundingBoxes.push(...bbox);
            }
        }
    
        if (paragraph) {
            lines.push({
                text: paragraph,
                boundingBox: this.getBoundingBox(boundingBoxes)
            });
        }
    
        return lines;
    }
    
    // boundingBox 계산 함수
    private getBoundingBox(boundingBoxes: any[]): any[] {
        if (boundingBoxes.length === 0) return [];
        const xMin = Math.min(...boundingBoxes.map(b => b.x));
        const yMin = Math.min(...boundingBoxes.map(b => b.y));
        const xMax = Math.max(...boundingBoxes.map(b => b.x));
        const yMax = Math.max(...boundingBoxes.map(b => b.y));
    
        return [
            { x: xMin, y: yMin },
            { x: xMax, y: yMin },
            { x: xMax, y: yMax },
            { x: xMin, y: yMax }
        ];
    }

    private async processImage(imageBuffer: Buffer, fileType: string): Promise<Buffer> {
        try {
            return await sharp(imageBuffer)
                .resize({ width: 1080 })
                .toBuffer();
        } catch (error) {
            console.error('📌 이미지 처리 실패:', error.message);
            throw new InternalServerErrorException('이미지 처리 중 오류가 발생했습니다.');
        }
    }

    private getFileFormat(fileType: string): string {
        const mimeTypeMap: Record<string, string> = {
            'image/jpeg': 'jpeg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'application/pdf': 'pdf',
        };
    
        return mimeTypeMap[fileType] || 'jpg';
    }
}
