import {
  Controller,
  Get,
  UseGuards,
  Request,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { UserEntity } from 'src/entities/User.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get('/me')
  all(@Request() req): Promise<UserEntity> {
    return this.userService.getById(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('/remove')
  remove(@Body() target: number): Promise<void> {
    this.userService.remove(target);
    return;
  }

  @UseGuards(AuthGuard)
  @Get('/update')
  update(@Body() updateDTO: Partial<UserEntity>): Promise<void> {
    const { id, ...data } = updateDTO;
    if (!id) {
      throw new BadRequestException('Id field is required');
    }
    this.userService.update(id, data);
    return;
  }
}
