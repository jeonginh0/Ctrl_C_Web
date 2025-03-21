import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, User } from '../entity/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  // 사용자가 이메일로 존재하는지 확인하는 메서드
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // 이메일과 패스워드를 통해 사용자 조회
  async findByEmailAndPassword(email: string, password: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email, password }).exec();
  }

  // 추가적인 CRUD 메서드를 작성할 수 있음 (예: 회원가입, 패스워드 변경 등)
  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async updateUser(email: string, updateUserDto: UpdateUserDto): Promise<UserDocument | null> {
    return this.userModel.findOneAndUpdate({ email }, updateUserDto, { new: true }).exec();
  }
}
