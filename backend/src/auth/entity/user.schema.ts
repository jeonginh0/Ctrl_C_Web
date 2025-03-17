import { Schema, Document } from 'mongoose';

export type UserDocument = User & Document;

export class User {
  username: string;
  email: string;
  password: string;
  role: string;
}

export const UserSchema = new Schema<User>({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});
