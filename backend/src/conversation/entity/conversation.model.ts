import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'ChatRoom' })
  chatRoomId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ type: String })
  userResponse: string;

  @Prop({ type: String })
  gptResponse: string;

  @Prop({ type: Date })
  userCreatedAt: Date;

  @Prop({ type: Date })
  gptCreatedAt: Date;
}

export type ConversationDocument = Conversation & Document;
export const ConversationSchema = SchemaFactory.createForClass(Conversation);