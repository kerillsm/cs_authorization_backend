import { JwtService } from '@nestjs/jwt';
import { UserService } from './../user/user.service';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import md5 from 'md5';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<string> {
    const user = await this.userService.getByEmail(email);
    if (user?.password !== md5(password)) {
      throw new UnauthorizedException();
    }
    const payload = { id: user.id, email: user.email };

    return this.jwtService.signAsync(payload);
  }

  async register(email: string, name: string, password: string): Promise<void> {
    try {
      await this.userService.create(email, name, md5(password));
    } catch (err) {
      throw new BadRequestException('Could not register');
    }
  }
}
