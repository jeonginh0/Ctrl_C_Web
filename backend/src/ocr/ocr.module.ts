import { Module } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { OcrController } from './ocr.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { OcrResult, OcrResultSchema } from './entity/ocr-result.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: OcrResult.name, schema: OcrResultSchema }])],
    controllers: [OcrController],
    providers: [OcrService],
})
export class OcrModule {}
