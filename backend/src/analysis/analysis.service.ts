import { Injectable, ForbiddenException, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
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
          - 이때, 내용이 존재한다면 추출하지 말고 그 내용이 포함된 전체 문장을 반환합니다. 또한, 내용을 조합하여 생성 및 반환하지 마세요.
          - 만약 내용이 없다면 "content": null을 반환합니다.

        [체크리스트]
        1. 기본 계약 정보
          1-1. 임대인 정보 확인
          1-2. 임차인 정보 확인
          1-3. 계약 기간 명시
          1-4. 계약 대상(주택 주소, 면적) 명확하게 기재

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
        3. **위험 요인 및 누락 요소 분석(필수):** 
           - 입력된 계약서 데이터의 위험 요소를 **"위험 요인"** 필드에 기록하세요.
           - 빠진 내용을 **"누락 요소"** 필드에 기록하세요.
           - 법률 용어가 포함되었다면 **"법률 단어"** 필드에 나열하세요.
        4. **절대 자연어 설명을 추가하지 마세요.**  
           - JSON 외에는 다른 문장을 출력하지 마세요.  
        5. **출력할 때 입력된 데이터 텍스트(text) 내용을 그대로 사용하고 내용을 정제하지 않은 상태(원본 텍스트 상태 유지) 그대로 출력하세요.**
        6. **status가 true인 항목들은 반드시 boundingBox 데이터가 존재해야 합니다. 해당 텍스트가 존재하는 문장의 boundingBox 데이터를 출력하세요.**

        📌 **출력 예시**
        json
        { 
          "기본 계약 정보": {
            "계약서 상 임대인 정보 확인": {
              "status": true/false,
              "content": "임대인 정보 내용"
            },
            "계약서 상 임차인 정보 확인": {
              "status": true/false,
              "content": "임차인 정보 내용"
            },
            "계약 기간 명시": {
              "status": true/false,
              "content": "계약 기간 내용"
            },
            "계약 대상(주택 주소, 면적) 명확하게 기재": {
              "status": true/false,
              "content": "계약 대상(주소, 면적) 내용"
            },
          },
          "보증금 및 월세 조건": {
            "보증금 및 월세 명시 (금액 숫자 정확히 기입)": {
              "status": true/false,
              "content": "보증금 및 월세 내용"
            },
            "월세 납부 방법 명시 (계좌이체/현금 납부 방식)": {
              "status": true/false,
              "content": "납부 방법 내용"
            },
            "연체 시 연체이자율 기재 (법정 최고이자율 초과 금지)": {
              "status": true/false,
              "content": "연체이자율 내용"
            },
          },
          "관리비 및 공과금 부담 명확화": {
            "관리비 포함 항목 확인 (수도, 전기, 가스, 인터넷 등)": {
              "status": true/false,
              "content": "관리비 포함 항목 내용"
            },
            "개별 부담 항목(난방비, 주차비 등) 확인": {
              "status": true/false,
              "content": "개별 부담 항목 내용"
            },
          },
          "시설 및 수리 책임 조황: {
            "기본 시설물(도배, 장판, 가전 등) 유지·보수 책임 명확화": {
              "status": true/false,
              "content": "유지보수 책임 내용"
            },
            "계약 종료 시 원상복구 의무 여부 확인": {
              "status": true/false,
              "content": "원상복구 의무 여부 내용"
            },
          },
          "전세 계약 시 추가 확인 사항": {
            "전세보증보험 가입 가능 여부 확인": {
              "status": true/false,
              "content": "전세보증보험 가능 여부 내용"
            },
            "보증금 반환 기한 및 방식 명시": {
              "status": true/false,
              "content": "보증금 반환 내용"
            },
          },
          "반전세(준전세) 계약 시 추가 확인 사항": {
            "반전세 계약 관련 사항": {
              "status": true/false,
              "content": "반전세 관련 내용"
            },
          },
          "계약 해지 및 갱신 조건 명시": {
            "중도 해지 시 위약금 여부": {
              "status": true/false,
              "content": "위약금 여부 내용"
            },
            "계약 갱신 가능 여부 및 조건 명시": {
              "status": true/false,
              "content": "갱신 가능 여부 및 조건 내용"
            },
            "임대인의 중도 해지 가능 여부 (매매 시 계약 승계 여부 포함)": {
              "status": true/false,
              "content": "중도 해지 가능 여부 내용"
            },
          },
          "특약 사항 명시 (계약서에 추가 기재)": {
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