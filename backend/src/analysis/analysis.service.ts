import { Injectable, ForbiddenException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import axios from 'axios';
import { Analysis, AnalysisDocument } from './entity/analysis.schema';
import { OcrResult, OcrResultDocument } from '../ocr/entity/ocr-result.schema';

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
    const ocrData = await this.ocrResultModel.findOne({ userId: objectId }).sort({ createdAt: -1 });

    if (!ocrData) {
      console.warn(`⚠️ 해당 사용자의 OCR 데이터를 찾을 수 없습니다. userId: ${userId}`);
      throw new ForbiddenException('해당 사용자의 OCR 데이터가 존재하지 않습니다.');
    }

    const ocrTexts = ocrData.data || [];
    console.log('📄 OCR 데이터 개수:', ocrTexts.length);

    // GPT에게 분석 요청
    const gptResponse = await this.analyzeWithGPT(ocrTexts);
    
    if (!gptResponse) {
      console.error('❌ GPT 분석 결과가 없습니다.');
      throw new InternalServerErrorException('GPT 분석 결과를 가져올 수 없습니다.');
    }

    // GPT 응답을 OCR 데이터와 비교하여 boundingBox 찾기
    const formattedSections: Record<string, { status: boolean; content?: string; boundingBox?: { x: number; y: number }[] }> = {};
    for (const [key, value] of Object.entries(gptResponse || {})) {
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
        status: value?.status ?? false,
        content: value.content || null,
        boundingBox: matchedBoundingBox.length > 0 ? matchedBoundingBox : undefined,
      };
    }

    // 분석 결과 저장
    const contractAnalysis = new this.analysisModel({
      userId: objectId,
      sections: formattedSections,
    });

    console.log('✅ 계약서 분석 결과 저장 완료');
    return contractAnalysis.save();
  }

  private async analyzeWithGPT(ocrTexts: any[]): Promise<Record<string, any>> {
    try {
      const prompt = `
        당신은 사회초년생을 위한 전/월세 계약서 분석 전문가입니다.
        입력된 계약서 데이터를 아래 체크리스트를 기준으로 분석하세요.
        **데이터가 부족하더라도 분석을 시도하고, 입력된 데이터만을 기반으로 판단하세요.**
        **임의로 데이터를 생성하지 말고, 계약서에서 직접 찾은 정보만 반환하세요.**

        📌 **분석 기준 (체크리스트)**
        - 계약서에서 각 체크리스트 항목을 하나씩 찾아 분석하세요.
        - **각 항목에 대한 status 값을 true 또는 false로 설정하세요.**
          - 입력된 계약서 데이터에 존재하고 명확하다면 "status": true
          - 입력된 계약서 데이터에 없다면 "status": false
        - **각 항목에 대한 관련 내용을 "content"에 반환하세요.**
          - 입력된 계약서 데이터에서 찾은 해당 내용을 그대로 반환합니다.  
          - 만약 내용이 없다면 "content": null을 반환합니다.

        [체크리스트]
        1. 기본 계약 정보
            1-1. 계약서 상 임대인(집주인) 및 임차인(세입자) 정보 확인
            1-2. 계약 기간 명시
            1-3. 계약 대상(주택 주소, 면적) 명확하게 기재

        2. 보증금 및 월세 조건
            2-1. 보증금 및 월세 명시 (금액 숫자 정확히 기입)
            2-2. 월세 납부 방법 명시 (계좌이체/현금 납부 방식)
            2-3. 연체 시 연체이자율 기재 (법정 최고이자율 초과 금지)

        3. 관리비 및 공과금 부담 명확화
            3-1. 관리비 포함 항목 확인 (수도, 전기, 가스, 인터넷 등)
            3-2. 개별 부담 항목(난방비, 주차비 등) 확인

        4. 시설 및 수리 책임 조항
            4-1. 기본 시설물(도배, 장판, 가전 등) 유지·보수 책임 명확화
            4-2. 계약 종료 시 원상복구 의무 여부 확인

        5. 전세 계약 시 추가 확인 사항
            5-1. 전세보증보험 가입 가능 여부 확인
            5-2. 보증금 반환 기한 및 방식 명시

        6. 반전세(준전세) 계약 시 추가 확인 사항
            6-1. 보증금과 월세 비율 조정 가능 여부 확인
            6-2. 보증금 반환 조건 및 월세 변동 가능성 기재

        7. 계약 해지 및 갱신 조건 명시
            7-1. 중도 해지 시 위약금 여부
            7-2. 계약 갱신 가능 여부 및 조건 명시
            7-3. 임대인의 중도 해지 가능 여부 (매매 시 계약 승계 여부 포함)

        8. 특약 사항 명시 (계약서에 추가 기재)
            8-1. 도배, 장판 등 집 원상복구 여부
            8-2. 옵션 가구 및 가전제품 유지보수 책임자
            8-3. 임대인의 방문 가능 여부 및 사전 통보 조건
            8-4. 건물 매각 시 임차인 보호 조항 포함

        📌 **출력 규칙**
        1. **JSON 형식 유지:** 결과는 반드시 JSON 형식으로 출력하세요.
        2. **임대인, 임차인 정보:** 문장에 임대인 성명, 주소, 주민등록번호 등이 있는지 확인하고 해당 내용을 출력하세요.
        3. **위험 요인 및 누락 요소 분석:** 
           - 입력된 계약서 데이터의 위험 요소를 **"위험 요인"** 필드에 기록하세요.
           - 빠진 내용을 **"누락 요소"** 필드에 기록하세요.
           - 법률 용어가 포함되었다면 **"법률 단어"** 필드에 나열하세요.
        4. **절대 자연어 설명을 추가하지 마세요.**  
           - JSON 외에는 다른 문장을 출력하지 마세요.  
        5. **출력할 때 입력된 데이터 텍스트(text)를 그대로 사용하고 내용을 정제하지 않은 상태(원본 텍스트 상태 유지) 그대로 출력하세요**

        📌 **출력 예시**
        json
        {
          "임대인 정보 확인": {
            "status": true/false,
            "content": "임대인 정보 내용"
          },
          "임차인 정보 확인": {
            "status": true/false,
            "content": "임차인 정보 내용"
          },
          "계약 기간 명시": {
            "status": true/false,
            "content": "계약 기간 내용"
          },
          "계약 대상 명시": {
            "status": true/false,
            "content": "계약 대상(주소, 면적) 내용"
          },
          "보증금 및 월세 명시": {
            "status": true/false,
            "content": "보증금 및 월세 내용"
          },
          "월세 납부 방법 명시": {
            "status": true/false,
            "content": "납부 방법 내용"
          },
          "연체 시 연체이자율 기재": {
            "status": true/false,
            "content": "연체이자율 내용"
          },
          "관리비 포함 항목 확인": {
            "status": true/false,
            "content": "관리비 포함 항목 내용"
          },
          "개별 부담 항목 확인": {
            "status": true/false,
            "content": "개별 부담 항목 내용"
          },
          "기본 시설물 유지보수 책임 명확화": {
            "status": true/false,
            "content": "유지보수 책임 내용"
          },
          "계약 종료 시 원상복구 의무 여부 확인": {
            "status": true/false,
            "content": "원상복구 의무 여부 내용"
          },
          "전세보증보험 가입 가능 여부 확인": {
            "status": true/false,
            "content": "전세보증보험 가능 여부 내용"
          },
          "보증금 반환 기한 및 방식 명시": {
            "status": true/false,
            "content": "보증금 반환 내용"
          },
          "반전세 계약 관련 사항": {
            "status": true/false,
            "content": "반전세 관련 내용"
          },
          "계약 해지 시 위약금 여부": {
            "status": true/false,
            "content": "위약금 여부 내용"
          },
          "계약 갱신 가능 여부 및 조건 명시": {
            "status": true/false,
            "content": "갱신 가능 여부 및 조건 내용"
          },
          "임대인의 중도 해지 가능 여부": {
            "status": true/false,
            "content": "중도 해지 가능 여부 내용"
          },
          "도배, 장판 등 집 원상복구 여부": {
            "status": true/false,
            "content": "원상복구 여부 내용"
          },
          "옵션 가구 및 가전제품 유지보수 책임자": {
            "status": true/false,
            "content": "유지보수 책임자 내용"
          },
          "임대인의 방문 가능 여부 및 사전 통보 조건": {
            "status": true/false,
            "content": "방문 가능 여부 및 통보 조건 내용"
          },
          "건물 매각 시 임차인 보호 조항 포함": {
            "status": true/false,
            "content": "임차인 보호 조항 내용"
          },
          "위험 요인": "위험 요인 내용",
          "누락 요소": "누락 요소 내용",
          "법률 단어": "법률 단어1, 법률 단어2"
        }

        입력된 계약서 데이터:
        ${ocrTexts.map(item => item.text).join('\n')}
      `;

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