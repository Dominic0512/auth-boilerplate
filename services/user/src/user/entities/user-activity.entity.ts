import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  event: string;

  @Column('simple-json', { nullable: true })
  meta: object;

  @ManyToOne(() => User, (user) => user.activities)
  user: User;

  @Column()
  @Index()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}
