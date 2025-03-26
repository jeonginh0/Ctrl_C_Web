import { Injectable, ForbiddenException } from '@nestjs/common';
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

    const ocrData = await this.ocrResultModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean();

    if (!ocrData) {
      throw new ForbiddenException('해당 사용자의 OCR 데이터를 찾을 수 없습니다.');
    }

    const ocrTexts = ocrData?.data || [];

    for (const [key, value] of Object.entries(analysisResult)) {
      let matchedBoundingBox: { x: number; y: number }[] = [];

      if (value.content) {
        for (const ocrItem of ocrTexts) {
          if (ocrItem.text.includes(value.content)) {
            matchedBoundingBox = ocrItem.boundingBox;
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
      userId: new Types.ObjectId(userId),
      sections: formattedSections,
    });

    return contractAnalysis.save();
  }
}