import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// UserDocument 타입 정의
export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users' })  // 컬렉션 이름을 'users'로 명시
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: '' })
  image: string;

  @Prop({ enum: ['user', 'admin'], default: 'user' })
  role: string;

  @Prop({ default: Date.now })
  createAt: Date;
}

// UserSchema 생성
export const UserSchema = SchemaFactory.createForClass(User);
