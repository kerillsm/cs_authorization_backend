import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { UserEntity } from 'src/entities/User.entity';
import { UserService } from './user.service';
import { CreateUserDTO } from './types';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('/me')
  me(@Request() req): Promise<UserEntity> {
    return this.userService.getById(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('/')
  all(): Promise<UserEntity[]> {
    return this.userService.getAll();
  }

  @UseGuards(AuthGuard)
  @Post('/')
  create(
    @Body()
    { email, name, password }: CreateUserDTO,
  ): Promise<UserEntity> {
    if (!email || !name || !password) {
      throw new BadRequestException('Validation failed');
    }
    return this.userService.create(email, name, password);
  }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  update(@Param('id') id: string, @Body() updateDTO: Partial<UserEntity>) {
    if (updateDTO.id || Object.keys(updateDTO).length === 0) {
      throw new BadRequestException('Validation failed');
    }
    return this.userService.update(+id, updateDTO);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
