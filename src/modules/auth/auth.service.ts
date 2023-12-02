import { JwtService } from '@nestjs/jwt';
import { UserService } from './../user/user.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import * as md5 from 'md5';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.getByEmail(email);
    if (!user) {
      throw new ForbiddenException('User with such email not found');
    }
    if (user.password !== md5(password)) {
      throw new ForbiddenException('Incorrect password');
    }

    const payload = { id: user.id, email: user.email };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('jwt_secret'),
    });

    return {
      access_token: 'Bearer ' + token,
    };
  }

  async register(email: string, name: string, password: string): Promise<void> {
    try {
      await this.userService.create(email, name, md5(password));
    } catch (err) {
      throw new BadRequestException('Could not register');
    }
  }
}
