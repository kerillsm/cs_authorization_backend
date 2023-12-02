import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  login(@Body() { email, password }: { email: string; password: string }) {
    if (!email || !password) {
      throw new BadRequestException('Validation failed');
    }
    return this.authService.login(email, password);
  }

  @Post('/register')
  register(
    @Body()
    {
      email,
      name,
      password,
    }: {
      email: string;
      name: string;
      password: string;
    },
  ) {
    if (!email || !name || !password) {
      throw new BadRequestException('Validation failed');
    }
    return this.authService.register(email, name, password);
  }
}
