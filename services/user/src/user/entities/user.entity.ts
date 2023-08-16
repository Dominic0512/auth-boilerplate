import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

import { UserProvider } from './user-provider.entity';

export enum UserStateEnum {
  Pending = 'Pending',
  Verified = 'Verified',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: UserStateEnum,
    default: UserStateEnum.Pending
  })
  state: UserStateEnum

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  passwordSalt?: string;

  @OneToMany(() => UserProvider, (provider) => provider.user, { cascade: true })
  providers: UserProvider[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}