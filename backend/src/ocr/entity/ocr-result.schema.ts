import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class OcrResult extends Document {
    @Prop({ type: Array, required: true })
    data: { text: string; boundingBox: { x: number; y: number }[] }[];
}

export const OcrResultSchema = SchemaFactory.createForClass(OcrResult);
