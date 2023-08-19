import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { UserProvider } from './user-provider.entity';

export enum UserRoleEnum {
  User = 'User',
  Admin = 'Admin'
}

export enum UserStateEnum {
  Pending = 'Pending',
  Verified = 'Verified',
}

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
    default: UserStateEnum.Pending
  })
  state: UserStateEnum;

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    default: UserRoleEnum.User
  })
  role: UserRoleEnum;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  @Exclude()
  password?: string;

  @Column({ nullable: true })
  @Exclude()
  passwordSalt?: string;

  @OneToMany(() => UserProvider, (provider) => provider.user, { cascade: true })
  providers: UserProvider[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}