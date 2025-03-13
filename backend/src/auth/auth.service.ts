import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { User, UserDocument } from './entity/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET;
  private readonly emailVerificationCodes = new Map<string, string>();
  private readonly verifiedEmails = new Set<string>(); // 인증된 이메일 저장

  constructor(@InjectModel(User.name) public userModel: Model<UserDocument>) {}

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
    
    console.log(`인증 코드: ${code}`); // 콘솔에 인증 코드 출력 (디버깅용)
    await transporter.sendMail(mailOptions);
  }

  async generateAndSendVerificationCode(email: string): Promise<void> {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.emailVerificationCodes.set(email, verificationCode);

    await this.sendVerificationCode(email, verificationCode);
  }

  verifyVerificationCode(email: string, code: string): boolean {
    const storedCode = this.emailVerificationCodes.get(email);
    if (!storedCode || storedCode !== code) {
      return false;
    }
    this.emailVerificationCodes.delete(email);
    this.verifiedEmails.add(email); // 인증된 이메일 저장
    return true;
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password, role } = createUserDto;

    if (!this.verifiedEmails.has(email)) {
      throw new Error('이메일 인증이 완료되지 않았습니다.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({
      username,
      email,
      password: hashedPassword,
      role,
    });

    this.verifiedEmails.delete(email); // 회원가입 완료 후 인증된 이메일 삭제

    return user.save();
  }

  async login(loginUserDto: LoginUserDto): Promise<{ token: string; user: User }> {
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

      const payload = { email: user.email, role: user.role };
      const token = jwt.sign(payload, this.JWT_SECRET);

      return { token, user };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`로그인 중 오류가 발생했습니다: ${error.message}`);
      }
      throw new Error('예상치 못한 오류가 발생했습니다.');
    }
  }
}
