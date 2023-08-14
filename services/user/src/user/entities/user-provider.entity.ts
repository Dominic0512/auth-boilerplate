import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne
} from 'typeorm';

import { User } from './user.entity';

export enum ProviderEnum {
  Facebook = 'Facebook',
  Google = 'Google',
  Primary = 'Primary'
}
@Entity()
export class UserProvider {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ProviderEnum
  })
  name: ProviderEnum;

  @Column()
  picture: string;

  @ManyToOne(() => User, (user) => user.providers)
  user: User;
}
