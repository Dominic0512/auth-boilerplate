import { Entity, Column, ManyToOne, PrimaryColumn } from "typeorm";

import { UserProviderEnum } from "../../common/enum/user.enum";
import type { User } from "./user.entity";

@Entity()
export class UserProvider {
  @Column({
    type: "enum",
    enum: UserProviderEnum,
  })
  @PrimaryColumn()
  name: UserProviderEnum;

  @Column()
  picture: string;

  @ManyToOne("User", "providers")
  user: User;

  @PrimaryColumn()
  userId: number;
}
