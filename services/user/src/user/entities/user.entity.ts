import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { UserStateEnum, UserRoleEnum } from '../../common/enum/user.enum';
import { UserProvider } from './user-provider.entity';
import type { UserActivity } from './user-activity.entity';

@Entity()
export class User {
  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: UserStateEnum,
    default: UserStateEnum.Pending,
  })
  state: UserStateEnum;

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    default: UserRoleEnum.User,
  })
  role: UserRoleEnum;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password?: string;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  passwordSalt?: string;

  @OneToMany('UserProvider', 'user', { cascade: true })
  providers: UserProvider[];

  @OneToMany('UserActivity', 'user', { cascade: true })
  activities: UserActivity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastSessionAt: Date;

  @Column({ default: 0 })
  loggedInCount: number;
}
