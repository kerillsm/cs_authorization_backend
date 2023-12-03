import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, RegisterDTO } from './types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  login(@Body() { email, password }: LoginDTO) {
    if (!email || !password) {
      throw new BadRequestException('Validation failed');
    }
    return this.authService.login(email, password);
  }

  @Post('/register')
  register(
    @Body()
    { email, name, password }: RegisterDTO,
  ) {
    if (!email || !name || !password) {
      throw new BadRequestException('Validation failed');
    }
    return this.authService.register(email, name, password);
  }
}
