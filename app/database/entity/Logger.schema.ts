import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Logger {

  @PrimaryGeneratedColumn()
  id: number;

  @Column('text') 
  message: string;

  @Column({
    type: "tinyint",
    default: 0
  })
  type: number;

  @Column({
    type: "tinyint",
    default: 0
  })
  status: number;

  @CreateDateColumn() public created: Date;
  @UpdateDateColumn() public updated: Date;
}
