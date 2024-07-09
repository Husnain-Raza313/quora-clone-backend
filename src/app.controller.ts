import {
  Controller,
  Post,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';

@Controller('app')
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('/login')
  async login(@Request() req): Promise<any> {
    const user = await this.userService.findByUsername(req.body.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const password = await this.userService.hashPassword(
      req.body.password,
      user.salt,
    );
    if (user.password === password) {
      const token = await this.authService.generateToken(user);
      return { token };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
