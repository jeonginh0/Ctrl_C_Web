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

  @Prop({ type: Map, of: SectionSchema })
  sections: Record<string, Section>;
}

export const AnalysisSchema = SchemaFactory.createForClass(Analysis);
