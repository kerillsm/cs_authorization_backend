import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({ unique: true })
  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;
}
