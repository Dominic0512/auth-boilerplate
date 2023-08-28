import {
  Entity,
  Column,
  ManyToOne,
  PrimaryColumn
} from 'typeorm';

import { UserProviderEnum } from '../../common/enum/user.enum';
import { User } from './user.entity';

@Entity()
export class UserProvider {
  @Column({
    type: 'enum',
    enum: UserProviderEnum,
  })
  @PrimaryColumn()
  name: UserProviderEnum;

  @Column()
  picture: string;

  @ManyToOne(() => User, (user) => user.providers)
  user: User;

  @PrimaryColumn()
  userId: number;
}
