import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index
} from 'typeorm';

@Entity()
export class UserActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  event: string;

  @Column('simple-json', { nullable: true })
  meta: object;

  @Column()
  @Index()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}
