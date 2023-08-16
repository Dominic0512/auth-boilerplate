import {
  Entity,
  Column,
  ManyToOne,
  PrimaryColumn
} from 'typeorm';

import { User } from './user.entity';

export enum ProviderEnum {
  Facebook = 'Facebook',
  Google = 'Google',
  Primary = 'Primary'
}
@Entity()
export class UserProvider {
  @Column({
    type: 'enum',
    enum: ProviderEnum,
  })
  @PrimaryColumn()
  name: ProviderEnum;

  @Column()
  picture: string;

  @ManyToOne(() => User, (user) => user.providers)
  user: User;

  @PrimaryColumn()
  userId: number;
}
