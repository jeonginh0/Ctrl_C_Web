import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface User {
  username: string;
  email: string;
  password: string;
  image: string;
  role: string;
  createAt: Date;
}

export type UserDocument = User & Document;

export const UserSchema = new Schema<UserDocument>({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  image: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createAt: { type: Date, default: Date.now },
});

// User 모델 생성
const UserModel = mongoose.model<UserDocument>('User', UserSchema);

export default UserModel;
