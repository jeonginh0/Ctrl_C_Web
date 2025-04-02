import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalysisService } from './analysis.service';
import { Analysis, AnalysisSchema } from './entity/analysis.schema';
import { OcrResult, OcrResultSchema } from '../ocr/entity/ocr-result.schema';
import { AnalysisController } from './analysis.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Analysis.name, schema: AnalysisSchema },
      { name: OcrResult.name, schema: OcrResultSchema },
    ]),
  ],
  controllers: [AnalysisController],
  providers: [AnalysisService]
})
export class AnalysisModule {}