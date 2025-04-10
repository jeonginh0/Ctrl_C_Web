import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type OcrResultDocument = OcrResult & Document;

@Schema({ timestamps: true })
export class OcrResult extends Document {
    @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: 'User' }) // 🔹 ObjectId 타입 추가
    userId: MongooseSchema.Types.ObjectId;

    @Prop({ type: Array, required: true })
    data: { text: string; boundingBox: { x: number; y: number }[] }[];

    @Prop({ required: true })
    image: string;

    @Prop({ type: Number, required: true })
    imageWidth: number;
  
    @Prop({ type: Number, required: true })
    imageHeight: number;
}

export const OcrResultSchema = SchemaFactory.createForClass(OcrResult);
