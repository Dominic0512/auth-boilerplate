import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
} from "typeorm";
import type { User } from "./user.entity";

@Entity()
export class UserActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  event: string;

  @Column("simple-json", { nullable: true })
  meta: object;

  @ManyToOne("User", "activities")
  user: User;

  @Column()
  @Index()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}
