import md5 from 'md5';
import { Injectable } from '@nestjs/common';
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
    return this.usersRepository.create({ email, name, password });
  }

  getAll() {
    return this.usersRepository.find();
  }

  getById(id: number) {
    // TODO: return undefined if not found
    return this.usersRepository.findOneBy({ id });
  }

  getByEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOneBy({ email });
  }

  remove(id: number) {
    // TODO: return deleted entity
    return this.usersRepository.delete(id);
  }

  update(id: number, data: Partial<UserEntity>) {
    // TODO: return updated
    return this.usersRepository.update({ id }, data);
  }
}
