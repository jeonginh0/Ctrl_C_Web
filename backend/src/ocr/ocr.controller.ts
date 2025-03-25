import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';

@Controller('ocr')
export class OcrController {
    constructor(private readonly ocrService: OcrService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async analyzeContract(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('파일이 업로드되지 않았습니다.');
        }

        return this.ocrService.analyzeContract(file.buffer, file.mimetype);
    }
}
