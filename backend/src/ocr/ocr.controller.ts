import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { OcrUploadDto } from './dto/ocr-upload.dto';

@Controller('ocr')
export class OcrController {
    constructor(private readonly ocrService: OcrService) {}

    @Post('upload')
    async analyzeContract(@Body() ocrUploadDto: OcrUploadDto) {
        const { base64Image } = ocrUploadDto;

        if (!base64Image) {
            throw new BadRequestException('이미지 데이터가 없습니다.');
        }

        // Base64 디코딩하여 Buffer 변환
        const imageBuffer = Buffer.from(base64Image, 'base64');

        return this.ocrService.analyzeContract(imageBuffer);
    }
}
