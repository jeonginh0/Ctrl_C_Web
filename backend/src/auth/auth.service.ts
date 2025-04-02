import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { User, UserDocument } from './entity/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const uploadDir = path.join(process.cwd(), '/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer 설정
export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

export const upload: multer.Options = {
  storage: storage,
};

@Injectable()
export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET;
  private readonly emailVerificationCodes = new Map<string, string>();
  private readonly verifiedEmails = new Set<string>();

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // 이메일 인증번호 전송
  private async sendVerificationCode(email: string, code: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '[CTRL+C] 이메일 인증 코드',
      text: `인증 코드는: ${code}`,
    };
    
    console.log(`인증 코드: ${code}`);
    await transporter.sendMail(mailOptions);
  }

  async generateAndSendVerificationCode(email: string): Promise<void> {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    this.emailVerificationCodes.delete(email);
    this.emailVerificationCodes.set(email, verificationCode);

    await this.sendVerificationCode(email, verificationCode);
  }

  // 인증번호 확인
  verifyVerificationCode(email: string, code: string): { message: string } {
    const storedCode = this.emailVerificationCodes.get(email);
    
    if (!storedCode || storedCode !== code) {
      throw new HttpException('잘못된 인증번호입니다.', HttpStatus.BAD_REQUEST);
    }
  
    this.verifiedEmails.add(email);
  
    return { message: '인증 코드가 확인되었습니다.' };
  }

  async register(createUserDto: CreateUserDto): Promise<UserDocument> {
    const { username, email, password, image, role } = createUserDto;

    if (!this.verifiedEmails.has(email)) {
      throw new Error('이메일 인증이 완료되지 않았습니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      username,
      email,
      password: hashedPassword,
      image,
      role,
    });

    this.verifiedEmails.delete(email);

    return user.save();
  }

  // 로그인
  async login(loginUserDto: LoginUserDto): Promise<{ token: string; user: UserDocument }> {
    const { email, password } = loginUserDto;

    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new Error('잘못된 자격 증명입니다.');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('잘못된 자격 증명입니다.');
      }

      if (!this.JWT_SECRET) {
        throw new Error('JWT_SECRET이 정의되지 않았습니다.');
      }

      const payload = { _id: user._id, email: user.email, role: user.role };
      const token = jwt.sign(payload, this.JWT_SECRET, { expiresIn: '12h' });

      return { token, user };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`로그인 중 오류가 발생했습니다: ${error.message}`);
      }
      throw new Error('예상치 못한 오류가 발생했습니다.');
    }
  }

  // 내 정보 조회
  async getProfile(userEmail: string): Promise<{ email: string, username: string, password: string, image: string, createAt: Date }> {
    const user = await this.userModel.findOne({ email: userEmail }).exec();

    if (!user) {
      throw new HttpException('사용자를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    return {
      email: user.email,
      username: user.username,
      password: user.password,
      image: user.image,
      createAt: user.createAt,
    };
  }

  // 프로필 정보 업데이트
  async updateProfile(userEmail: string, updateUserDto: UpdateUserDto, file: Express.Multer.File): Promise<{ updatedUser: UserDocument, token: string }> {
    const existingUser = await this.userModel.findOne({ email: userEmail });

    if (!existingUser) {
      throw new HttpException('사용자를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    const { username, password, image } = updateUserDto;

    const hashedPassword = password ? await bcrypt.hash(password, 10) : existingUser.password;

    // 파일이 존재하면 상대 경로로 변환
    const imagePath = file ? `/uploads/${file.filename}` : existingUser.image;

    const updatedData = {
      username: username ?? existingUser.username,
      password: hashedPassword,
      image: imagePath,  // 상대 경로로 저장
    };

    // JWT_SECRET 체크
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET이 정의되지 않았습니다.');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { email: userEmail },
      updatedData,
      { new: true }
    ).exec();

    if (!updatedUser) {
      throw new HttpException('사용자 정보 업데이트에 실패했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // JWT 토큰 발급
    const payload = { email: updatedUser.email, role: updatedUser.role };
    const token = jwt.sign(payload, this.JWT_SECRET, { expiresIn: '12h' });

    return { updatedUser, token };  // 반환 타입 수정
  }
  
  // 회원탈퇴
  async deleteUser(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email }).exec();
    
    if (!user) {
      throw new HttpException('사용자를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
  
    await this.userModel.deleteOne({ email }).exec();
    
    return { message: '회원탈퇴가 완료되었습니다.' };
  }
}
