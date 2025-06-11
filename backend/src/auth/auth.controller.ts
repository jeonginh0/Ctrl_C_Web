import { Body, Controller, Post, Get, Patch, Delete, UseGuards, Request, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';  // Express 타입을 추가
import { upload } from './auth.service';  // multer의 upload 변수

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

  // JWT 인증 후 프로필 조회
  @UseGuards(JwtAuthGuard) // JWT 인증을 위한 Guard 사용
  @Get('profile')
  findProfile(@Request() req): Promise<{ email: string; username: string; password: string; image: string; createAt: Date }> {
    const user = req.user; // JWT 토큰에서 user 정보 가져옴
    return this.authService.getProfile(user.email); // AuthService의 getProfile 메서드 호출
  }

  // 프로필 수정
  @UseGuards(JwtAuthGuard)
  @Patch('update-profile')
  @UseInterceptors(FileInterceptor('image', upload)) // 이미지 필드로 파일을 받음
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File, // Multer 파일 타입 명시
  ) {
    const userEmail = req.user.email; // JWT에서 이메일 정보 가져옴
  
    if (file) {
      // 업로드된 이미지의 파일 경로를 DTO에 추가
      updateUserDto.image = `/uploads/${file.filename}`;
    }
  
    // file을 전달하여 updateProfile 호출
    const updatedUser = await this.authService.updateProfile(userEmail, updateUserDto, file);
  
    return { message: '프로필이 성공적으로 업데이트되었습니다.', updatedUser };
  }

  // 회원탈퇴
  @Delete('delete/:email')
  async deleteUser(@Param('email') email: string): Promise<{ message: string }> {
    return this.authService.deleteUser(email);
  }
}
