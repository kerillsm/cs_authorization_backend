import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/User.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  create(email: string, name: string, password: string) {
    return this.usersRepository.save({ email, name, password });
  }

  getAll(): Promise<UserEntity[]> {
    return this.usersRepository.find();
  }

  getById(id: number): Promise<UserEntity | null> {
    return this.usersRepository.findOneBy({ id });
  }

  getByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async remove(id: number): Promise<{ deleted: true }> {
    const { affected } = await this.usersRepository.delete(id);
    if (!affected) {
      throw new BadRequestException('Error while updating');
    }
    return { deleted: true };
  }

  async update(
    id: number,
    data: Partial<UserEntity>,
  ): Promise<{ updated: true }> {
    const { affected } = await this.usersRepository.update({ id }, data);
    if (!affected) {
      throw new BadRequestException('Error while updating');
    }
    return { updated: true };
  }
}
