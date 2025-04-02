import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ocr')
export class OcrController {
    constructor(private readonly ocrService: OcrService) {}

    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async analyzeContract(@Request() req, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('파일이 업로드되지 않았습니다.');
        }

        const userId = req.user.userId;
        return this.ocrService.analyzeContract(userId, file.buffer, file.mimetype);
    }
}
