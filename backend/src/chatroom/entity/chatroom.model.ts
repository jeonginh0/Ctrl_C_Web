import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ChatRoom extends Document {
    @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ type: String, required: true })
    assistantId: string;

    @Prop({ type: String, default: null })
    threadId: string | null;

    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: Types.ObjectId, ref: 'Analysis' })
    analysisId?: Types.ObjectId;

    @Prop({ type: [Types.ObjectId], ref: 'Conversation', default: [] })
    conversations: Types.ObjectId[];
}

export type ChatRoomDocument = ChatRoom & Document;
export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);