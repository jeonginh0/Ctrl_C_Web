import { Injectable } from '@nestjs/common';
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

    async analyzeContract(imageBuffer: Buffer): Promise<any> {
        const response = await axios.post(
        this.OCR_API_URL,
            { images: [{ format: 'jpg', data: imageBuffer.toString('base64') }] },
            {
                headers: {
                'X-OCR-SECRET': this.OCR_SECRET,
                'Content-Type': 'application/json',
                },
            },
        );

        const extractedData = response.data.images[0].fields.map(field => ({
            text: field.inferText,
            boundingBox: field.boundingPoly.vertices,
        }));

        const savedResult = await new this.ocrModel({ data: extractedData }).save();

        return savedResult;
    }
}
