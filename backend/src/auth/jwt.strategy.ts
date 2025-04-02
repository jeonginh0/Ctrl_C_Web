import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from './auth.service';
import { User, UserDocument } from './entity/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,

    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    });
  }

  // validate 메서드에서 JWT Payload 기반으로 사용자 정보를 조회
  async validate(payload: { email: string; role: string }) {
    try {
      const user = await this.userModel.findOne({ email: payload.email });
  
      if (!user) {
        throw new Error('User not found');
      }
  
      console.log('✅ JWT 검증 완료:', user);
  
      return {
        userId: user._id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      throw new Error(`Error during validation: ${error.message}`);
    }
  }
}
