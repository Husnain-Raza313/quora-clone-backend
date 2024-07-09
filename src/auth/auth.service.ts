import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/schema/User';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async generateToken(payload: User) {
    const userPayload = { userId: payload._id, username: payload.username };
    return await this.jwtService.signAsync(userPayload);
  }
}
