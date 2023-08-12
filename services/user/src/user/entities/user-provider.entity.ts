import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne
} from 'typeorm';

import { User } from './user.entity';

@Entity()
export class UserProvider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  picture: string;

  @ManyToOne(() => User, (user) => user.providers)
  user: User;
}
