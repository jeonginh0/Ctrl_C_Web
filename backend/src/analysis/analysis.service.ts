import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Analysis, AnalysisDocument } from './entity/analysis.schema';
import { OcrResult, OcrResultDocument } from '../ocr/entity/ocr-result.schema';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectModel(Analysis.name) private analysisModel: Model<AnalysisDocument>,
    @InjectModel(OcrResult.name) private ocrResultModel: Model<OcrResultDocument>,
  ) {}

  async saveAnalysis(userId: string, analysisResult: Record<string, any>): Promise<Analysis> {
    const formattedSections: Record<
      string,
      { status: boolean; content?: string; boundingBox?: { x: number; y: number }[] }
    > = {};

    // 최신 OCR 결과 가져오기
    const ocrData = await this.ocrResultModel.findOne().sort({ createdAt: -1 }).lean();
    const ocrTexts = ocrData?.data || [];

    // GPT 응답을 OCR 데이터와 비교하여 boundingBox 찾기
    for (const [key, value] of Object.entries(analysisResult)) {
      let matchedBoundingBox: { x: number; y: number }[] = [];

      if (value.content) {
        for (const ocrItem of ocrTexts) {
          if (ocrItem.text.includes(value.content)) {
            matchedBoundingBox = ocrItem.boundingBox; // OCR에서 가져온 boundingBox 할당
            break;
          }
        }
      }

      formattedSections[key] = {
        status: value.status,
        content: value.content || null,
        boundingBox: matchedBoundingBox,
      };
    }

    const contractAnalysis = new this.analysisModel({
      userId: new Types.ObjectId(userId), // ✅ userId 추가
      sections: formattedSections,
    });

    return contractAnalysis.save();
  }
}
