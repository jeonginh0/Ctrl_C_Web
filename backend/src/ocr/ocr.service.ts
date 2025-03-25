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
            // 파일 확장자에 맞는 포맷 설정
            const format = fileType.includes('pdf') ? 'pdf' : 'jpg';

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

            // 응답 데이터 확인
            if (!response.data?.images || response.data.images.length === 0) {
                throw new InternalServerErrorException('OCR API 응답이 올바르지 않습니다.');
            }

            const extractedData = response.data.images[0].fields?.map(field => ({
                text: field.inferText,
                boundingBox: field.boundingPoly.vertices,
            })) || [];

            // OCR 결과 저장
            const savedResult = await new this.ocrModel({ data: extractedData }).save();

            return savedResult;
        } catch (error) {
            console.error('OCR 분석 실패:', error.message);
            throw new InternalServerErrorException('OCR 분석 중 오류가 발생했습니다.');
        }
    }
}
