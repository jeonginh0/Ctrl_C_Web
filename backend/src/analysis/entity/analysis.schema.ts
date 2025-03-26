import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AnalysisDocument = Analysis & Document;

class Section {
  @Prop({ required: true })
  status: boolean;

  @Prop()
  content?: string;

  @Prop({ type: [{ x: Number, y: Number }] })
  boundingBox?: { x: number; y: number }[];
}

@Schema({ timestamps: true })
export class Analysis {
  @Prop({ type: Types.ObjectId, required: true }) // ✅ userId 추가
  userId: Types.ObjectId;

  @Prop({ type: Map, of: Section })
  sections: Record<string, Section>;
}

export const AnalysisSchema = SchemaFactory.createForClass(Analysis);
