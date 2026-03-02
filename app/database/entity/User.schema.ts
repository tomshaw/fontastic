import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    length: 255
  })
  email: string;

  @Column({
    type: "varchar",
    length: 255
  })
  password: string;

  @Column()
  verified: boolean;

  @CreateDateColumn() public created: Date;
  @UpdateDateColumn() public updated: Date;
}
