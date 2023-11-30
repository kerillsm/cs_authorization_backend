import md5 from 'md5';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/User.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(email: string, name: string, unHashedPassword: string) {
    const password = md5(unHashedPassword);
    return this.usersRepository.create({ email, name, password });
  }

  get(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  remove(id: number) {
    return this.usersRepository.delete(id);
  }

  update(id: number, data: Partial<User>) {
    return this.usersRepository.update({ id }, data);
  }
}
