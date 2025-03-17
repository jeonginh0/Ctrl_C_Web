import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 이메일 인증번호 요청
  @Post('send-verification-code')
  async sendVerificationCode(@Body('email') email: string): Promise<{ message: string }> {
    await this.authService.generateAndSendVerificationCode(email);
    return { message: '인증 코드가 이메일로 전송되었습니다.' };
  }

  // 이메일 인증번호 확인
  @Post('verify-verification-code')
  verifyVerificationCode(
    @Body('email') email: string,
    @Body('verificationCode') verificationCode: string,
  ): { message: string } {
    const isVerified = this.authService.verifyVerificationCode(email, verificationCode);
    if (!isVerified) {
      throw new Error('유효하지 않거나 만료된 인증 코드입니다.');
    }
    return { message: '인증 코드가 확인되었습니다. 이제 회원가입을 진행할 수 있습니다.' };
  }

  // 회원가입
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<{ message: string }> {
    await this.authService.register(createUserDto);
    return { message: '회원가입이 성공적으로 완료되었습니다.' };
  }

  // 로그인
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
}
