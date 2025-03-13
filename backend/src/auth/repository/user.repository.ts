import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/user.schema';
import { Injectable } from '@nestjs/common';

@Injectable()
@EntityRepository(User)
export class UserRepository extends Repository<User> {
  // 사용자가 이메일로 존재하는지 확인하는 메서드
  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.findOne({ where: { email } });
    return user || undefined;
  }

  // 이메일과 패스워드를 통해 사용자 조회
  async findByEmailAndPassword(email: string, password: string): Promise<User | undefined> {
    const user = await this.findOne({ where: { email, password } });
    return user || undefined;
  }

  // 추가적인 CRUD 메서드를 작성할 수 있음 (예: 회원가입, 패스워드 변경 등)
}
