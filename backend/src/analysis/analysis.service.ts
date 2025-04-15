import { Injectable, ForbiddenException, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import axios from 'axios';
import { Analysis, AnalysisDocument } from './entity/analysis.schema';
import { OcrResult, OcrResultDocument } from '../ocr/entity/ocr-result.schema';
import { analysisPrompt } from '../textContent';

@Injectable()
export class AnalysisService {
  private readonly GPT_API_URL = 'https://api.openai.com/v1/chat/completions';
  private readonly GPT_API_KEY = process.env.GPT_API_KEY;

  constructor(
    @InjectModel(Analysis.name) private analysisModel: Model<AnalysisDocument>,
    @InjectModel(OcrResult.name) private ocrResultModel: Model<OcrResultDocument>,
  ) {}

  async saveAnalysis(userId: string): Promise<Analysis> {
    if (!userId) {
      console.error('❌ userId가 undefined입니다.');
      throw new BadRequestException('유효한 사용자 ID가 필요합니다.');
    }

    let objectId: Types.ObjectId;
    try {
      objectId = new Types.ObjectId(userId);
    } catch (error) {
      console.error('❌ userId 변환 오류:', error.message);
      throw new BadRequestException('잘못된 사용자 ID 형식입니다.');
    }

    console.log('🔍 요청된 userId:', userId);
    console.log('🔍 변환된 ObjectId:', objectId);

    // 로그인한 유저의 최신 OCR 결과 가져오기
    const ocrData = await this.ocrResultModel
      .findOne({ userId: objectId })
      .sort({ createdAt: -1 });

    if (!ocrData) {
      console.warn(`⚠️ 해당 사용자의 OCR 데이터를 찾을 수 없습니다. userId: ${userId}`);
      throw new ForbiddenException('해당 사용자의 OCR 데이터가 존재하지 않습니다.');
    }

    const ocrTexts = ocrData.data || [];
    const imagePath = ocrData.image;
    const imageWidth = ocrData.imageWidth; // 이미지 너비 가져오기
    const imageHeight = ocrData.imageHeight; // 이미지 높이 가져오기

    console.log('📄 OCR 데이터 개수:', ocrTexts.length);
    console.log('🖼️ 이미지 경로:', imagePath);
    console.log('📐 이미지 크기:', imageWidth, 'x', imageHeight);

    // GPT에게 분석 요청
    const gptResponse = await this.analyzeWithGPT(ocrTexts);
    
    if (!gptResponse) {
      console.error('❌ GPT 분석 결과가 없습니다.');
      throw new InternalServerErrorException('GPT 분석 결과를 가져올 수 없습니다.');
    }

    // 분석된 데이터로 계약서 항목에 맞게 Section 객체 형성
    const analysisData = this.mapGptResponseToAnalysis(gptResponse, ocrTexts);

    // 분석 결과 저장
    const contractAnalysis = new this.analysisModel({
      userId: objectId,
      image: imagePath,
      imageWidth, // 이미지 너비 추가
      imageHeight, // 이미지 높이 추가
      ...analysisData,  // 각 계약서 항목의 분석 결과를 객체 형태로 저장
    });

    console.log('✅ 계약서 분석 결과 저장 완료');
    return contractAnalysis.save();
  }

  // 분석결과 조회
  async getAnalysisById(analysisId: string, userId: string): Promise<Analysis> {
    if (!Types.ObjectId.isValid(analysisId) || !Types.ObjectId.isValid(userId)) {
      throw new NotFoundException('잘못된 ID 형식입니다.');
    }
  
    const analysis = await this.analysisModel.findOne({
      _id: new Types.ObjectId(analysisId),
      userId: new Types.ObjectId(userId), // 🔥 userId 일치하는지 확인
    });
  
    if (!analysis) {
      throw new NotFoundException('해당 ID의 분석 결과를 찾을 수 없거나, 접근 권한이 없습니다.');
    }
  
    return analysis;
  }

  private mapGptResponseToAnalysis(gptResponse: Record<string, any>, ocrTexts: any[]) {
    const analysisData = {
      기본계약정보: this.extractSections(gptResponse['기본 계약 정보'], ocrTexts),
      보증금및월세조건: this.extractSections(gptResponse['보증금 및 월세 조건'], ocrTexts),
      관리비및공과금부담명확화: this.extractSections(gptResponse['관리비 및 공과금 부담 명확화'], ocrTexts),
      시설및수리책임조항: this.extractSections(gptResponse['시설 및 수리 책임 조항'], ocrTexts),
      전세계약시추가확인사항: this.extractSections(gptResponse['전세 계약 시 추가 확인 사항'], ocrTexts),
      반전세계약시추가확인사항: this.extractSections(gptResponse['반전세(준전세) 계약 시 추가 확인 사항'], ocrTexts),
      계약해지및갱신조건명시: this.extractSections(gptResponse['계약 해지 및 갱신 조건 명시'], ocrTexts),
      특약사항명시: this.extractSections(gptResponse['특약 사항 명시 (계약서에 추가 기재)'], ocrTexts),
      위험요인: gptResponse['위험 요인'] || null,
      누락요소: gptResponse['누락 요소'] || null,
      법률단어: gptResponse['법률 단어'] || null,
    };
    return analysisData;
  }

  private extractSections(gptSection: any, ocrTexts: any[]) {
    const sectionData: Record<string, any> = {};
  
    if (gptSection) {
      Object.entries(gptSection).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null && 'content' in value && 'status' in value) {
          const valueTyped = value as { content: string; status: boolean };
  
          let matchedBoundingBox: { x: number; y: number }[] = [];
  
          if (valueTyped.content) {
            for (const ocrItem of ocrTexts) {
              if (ocrItem.text.includes(valueTyped.content)) {
                matchedBoundingBox = ocrItem.boundingBox;
                break;
              }
            }
          }
  
          // status를 boolean으로만 저장
          sectionData[key] = {
            status: valueTyped.status,  // 객체가 아닌 단순 boolean으로 설정
            content: valueTyped.content || null,
            boundingBox: matchedBoundingBox.length > 0 ? matchedBoundingBox : undefined,
          };
        } else {
          console.warn(`'value'의 형식이 예상과 다릅니다: ${value}`);
        }
      });
    }
  
    return sectionData;
  }

  private async analyzeWithGPT(ocrTexts: any[]): Promise<Record<string, any>> {
    try {
      const prompt = analysisPrompt(ocrTexts);

      const response = await axios.post(
        this.GPT_API_URL,
        {
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: '당신은 부동산 계약서 분석 AI입니다.' }, { role: 'user', content: prompt }],
          temperature: 0.3,
        },
        { headers: { Authorization: `Bearer ${this.GPT_API_KEY}`, 'Content-Type': 'application/json' } }
      );

      const gptContent = response.data.choices?.[0]?.message?.content;
      if (!gptContent) {
        throw new InternalServerErrorException('GPT 응답이 비어 있습니다.');
      }
      console.log('📌 GPT 원본 응답:', gptContent);

      let formattedResponse = gptContent.trim();
      if (formattedResponse.startsWith('```json')) {
        formattedResponse = formattedResponse.replace(/^```json/, '').replace(/```$/, '').trim();
      }

      try {
        return JSON.parse(formattedResponse);
      } catch (parseError) {
        throw new InternalServerErrorException('GPT 응답을 JSON으로 변환할 수 없습니다.');
      }
    } catch (error) {
      console.error('📌 GPT 요청 실패:', error.message);
      throw new InternalServerErrorException('GPT 요청 중 오류가 발생했습니다.');
    }
  }
}