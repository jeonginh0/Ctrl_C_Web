import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type AnalysisDocument = Analysis & Document;

@Schema()
class Section {
  @Prop({ required: true, default: false })
  status: boolean;

  @Prop()
  content?: string;

  @Prop({ type: [{ x: Number, y: Number }] })
  boundingBox?: { x: number; y: number }[];
}

const SectionSchema = SchemaFactory.createForClass(Section);

@Schema({ timestamps: true })
export class Analysis {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  image: string;

  @Prop({ type: Number })
  imageWidth: number;
  
  @Prop({ type: Number })
  imageHeight: number;

  @Prop({ type: Map, of: SectionSchema })
  기본계약정보: Record<string, Section>;

  @Prop({ type: Map, of: SectionSchema })
  보증금및월세조건: Record<string, Section>;

  @Prop({ type: Map, of: SectionSchema })
  관리비및공과금부담명확화: Record<string, Section>;

  @Prop({ type: Map, of: SectionSchema })
  시설및수리책임조항: Record<string, Section>;

  @Prop({ type: Map, of: SectionSchema })
  전세계약시추가확인사항: Record<string, Section>;

  @Prop({ type: Map, of: SectionSchema })
  반전세계약시추가확인사항: Record<string, Section>;

  @Prop({ type: Map, of: SectionSchema })
  계약해지및갱신조건명시: Record<string, Section>;

  @Prop({ type: Map, of: SectionSchema })
  특약사항명시: Record<string, Section>;

  @Prop()
  위험요인?: string;

  @Prop()
  누락요소?: string;

  @Prop()
  법률단어?: string;
}

export const AnalysisSchema = SchemaFactory.createForClass(Analysis);
