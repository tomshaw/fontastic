import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class SmartCollection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
  })
  title: string;

  @Column({
    type: 'text',
  })
  rules: string;

  @Column({
    type: 'varchar',
    length: 3,
    default: 'AND',
  })
  match_type: string;

  @Column({
    type: 'smallint',
    default: 0,
  })
  orderby: number;

  @Column({
    type: 'smallint',
    default: 0,
  })
  enabled: number;

  @CreateDateColumn() public created: Date;
  @UpdateDateColumn() public updated: Date;
}
