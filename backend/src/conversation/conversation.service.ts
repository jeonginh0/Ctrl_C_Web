import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from './entity/conversation.model';
import { OpenAI } from 'openai';
import { chatbotPrompt } from './textContent';
import { Analysis, AnalysisDocument } from '../analysis/entity/analysis.schema';
import { ChatRoom, ChatRoomDocument } from 'src/chatroom/entity/chatroom.model';

@Injectable()
export class ConversationService {
    private openai: OpenAI;
    private assistantId: string;

    constructor(
        @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
        @InjectModel(Analysis.name) private analysisModel: Model<AnalysisDocument>,
        @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoomDocument>
    ) {
        this.openai = new OpenAI({ apiKey: process.env.GPT_API_KEY });
        const assistantId = process.env.OPENAI_ASSISTANT_ID;
        if (!assistantId) {
        throw new Error('환경변수에 assistant ID가 없습니다.');
        }
        this.assistantId = assistantId;
    }

    async createAssistant() {
        const assistant = await this.openai.beta.assistants.create({
                name: `컨씨`,
                instructions: chatbotPrompt,
                model: 'gpt-4o-mini',
            });
        console.log('Assistant Id:', assistant.id);
        return assistant.id;
    }

    async sendInitialMessage(userId: string, chatRoomId: string, analysisId: string | null, threadId: string) {
        let assistantMessage = "안녕하세요! 부동산 전문가 컨씨입니다. 무엇을 도와드릴까요?";
    
        if (analysisId) {
            try {
                // 1. 직접 쿼리하되 lean() 옵션 사용
                const analysis = await this.analysisModel.findById(analysisId).lean();
                console.log("분석 데이터 찾음:", !!analysis);
                
                if (analysis) {
                    // 2. 데이터를 문자열로 변환 후 다시 객체로 파싱 (참조 문제 해결)
                    const rawData = JSON.parse(JSON.stringify(analysis));
                    
                    // 3. 명시적인 키 접근 시도
                    let contractSummary = `
                    [참고용 계약서 정보]
                    - 계약서 상 임대인 정보 확인: ${rawData['기본계약정보'] && rawData['기본계약정보']['계약서 상 임대인 정보 확인'] ? rawData['기본계약정보']['계약서 상 임대인 정보 확인']['content'] : "정보 없음"}
                    - 계약서 상 임차인 정보 확인: ${rawData['기본계약정보'] && rawData['기본계약정보']['계약서 상 임차인 정보 확인'] ? rawData['기본계약정보']['계약서 상 임차인 정보 확인']['content'] : "정보 없음"}
                    - 계약 기간 명시: ${rawData['기본계약정보'] && rawData['기본계약정보']['계약 기간 명시'] ? rawData['기본계약정보']['계약 기간 명시']['content'] : "정보 없음"}
                    - 계약 대상(주택 주소, 면적): ${rawData['기본계약정보'] && rawData['기본계약정보']['계약 대상(주택 주소, 면적) 명확하게 기재'] ? rawData['기본계약정보']['계약 대상(주택 주소, 면적) 명확하게 기재']['content'] : "정보 없음"}
                    
                    - 보증금 및 월세: ${rawData['보증금및월세조건'] && rawData['보증금및월세조건']['보증금 및 월세 명시 (금액 숫자 정확히 기입)'] ? rawData['보증금및월세조건']['보증금 및 월세 명시 (금액 숫자 정확히 기입)']['content'] : "정보 없음"}
                    - 월세 납부 방법: ${rawData['보증금및월세조건'] && rawData['보증금및월세조건']['월세 납부 방법 명시 (계좌이체/현금 납부 방식)'] ? rawData['보증금및월세조건']['월세 납부 방법 명시 (계좌이체/현금 납부 방식)']['content'] : "정보 없음"}
                    
                    - 관리비 포함 항목: ${rawData['관리비및공과금부담명확화'] && rawData['관리비및공과금부담명확화']['관리비 포함 항목 확인 (수도, 전기, 가스, 인터넷 등)'] ? rawData['관리비및공과금부담명확화']['관리비 포함 항목 확인 (수도, 전기, 가스, 인터넷 등)']['content'] : "정보 없음"}
                    - 개별 부담 항목: ${rawData['관리비및공과금부담명확화'] && rawData['관리비및공과금부담명확화']['개별 부담 항목(난방비, 주차비 등) 확인'] ? rawData['관리비및공과금부담명확화']['개별 부담 항목(난방비, 주차비 등) 확인']['content'] : "정보 없음"}
                    
                    - 위험 요소: ${rawData.위험요인 || "특별한 위험 요소 없음"}
                    - 누락된 요소: ${rawData.누락요소 || "누락된 요소 없음"}
                    
                    [이 정보는 사용자에게 직접 출력되지 않으며, 계약서 관련 질문에 활용됩니다.]
                    `;
                    
                    assistantMessage += `\n\n(내부 참고용 정보: ${contractSummary})`;
                    console.log(assistantMessage);
                }
            } catch (error) {
                console.error("데이터 접근 중 오류 발생:", error);
                assistantMessage += "\n\n(내부 참고용 정보: 계약 정보 처리 중 오류가 발생했습니다.)";
            }
        }
    
        await this.openai.beta.threads.messages.create(threadId, {
            role: 'assistant',
            content: assistantMessage,
        });
    
        const newConversation = await this.conversationModel.create({
            chatRoomId,
            userId,
            userResponse: null,
            gptResponse: assistantMessage,
            stdCreatedAt: new Date(),
            gptCreatedAt: new Date(),
        });
    
        return newConversation.gptResponse;
    }
    

    async sendMessage(userId: string, chatRoomId: string, userResponse: string): Promise<string> {
        const chatRoom = await this.chatRoomModel.findById(chatRoomId);
        if (!chatRoom || !chatRoom.threadId) {
            throw new Error("채팅방을 찾을 수 없거나 threadId가 없습니다.");
        }
    
        const threadId = chatRoom.threadId;
    
        // 계약서 분석 정보가 있는 경우, 이를 참조하여 사용
        const analysisId = chatRoom.analysisId;
        let analysisData;
        
        if (analysisId) {
            try {
                // 계약서 분석 정보를 가져옴
                analysisData = await this.analysisModel.findById(analysisId).lean();
                if (!analysisData) {
                    console.log("계약서 분석 정보가 없습니다.");
                }
            } catch (error) {
                console.error("계약서 분석 정보를 가져오는 데 실패:", error);
            }
        }
    
        // 사용자 메시지 전송
        await this.openai.beta.threads.messages.create(threadId, {
            role: 'user',
            content: userResponse,
        });
    
        const run = await this.openai.beta.threads.runs.create(threadId, {
            assistant_id: this.assistantId,
        });
    
        let runStatus;
        do {
            runStatus = await this.openai.beta.threads.runs.retrieve(threadId, run.id);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        } while (runStatus.status !== 'completed');
    
        const messages = await this.openai.beta.threads.messages.list(threadId);
        const assistantReply = messages.data
            .flatMap((msg) => msg.content)
            .find((c) => c.type === 'text') as any;
    
        const gptResponse = assistantReply?.text?.value ?? '응답이 없습니다.';
    
        // 계약서 정보를 답변 내용에 포함시키지 않음
        const newConversation = await this.conversationModel.create({
            chatRoomId,
            userId,
            userResponse,
            gptResponse,  // 메시지 본문에 계약서 정보는 포함하지 않음
            stdCreatedAt: new Date(),
            gptCreatedAt: new Date(),
        });
    
        return newConversation.gptResponse;
    }

    async getConversations(chatRoomId: string) {
        return this.conversationModel.find({ chatRoomId }).sort({ stdCreatedAt: 1 });
    }

    async regenerateLastAnswer(chatRoomId: string, userId: string): Promise<string> {
        const lastConversation = await this.conversationModel.findOne({
            chatRoomId,
            userId,
        }).sort({ stdCreatedAt: -1 });

        if (!lastConversation || !lastConversation.userResponse) {
        throw new Error('재생성할 질문이 없습니다.');
        }

        return this.sendMessage(userId, chatRoomId, lastConversation.userResponse);
    }
}
