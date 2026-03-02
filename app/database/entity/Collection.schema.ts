import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Store } from "./Store.schema"

@Entity()
export class Collection {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100
  })
  title: string;

  @Column({
    type: "int",
    default: 0
  })
  parent_id: number;

  @Column({
    type: "smallint",
    default: 0
  })
  left_id: number;

  @Column({
    type: "smallint",
    default: 0
  })
  right_id: number;

  @Column({
    type: "smallint",
    default: 0
  })
  count: number;

  @Column({
    type: "smallint",
    default: 0
  })
  is_system: number;

  @Column({
    type: "smallint",
    default: 0
  })
  orderby: number;

  @Column({
    type: "smallint",
    default: 0
  })
  enabled: boolean;

  @Column({
    type: "smallint",
    default: 0
  })
  collapsed: boolean;

  @CreateDateColumn() public created: Date;
  @UpdateDateColumn() public updated: Date;

  @OneToMany(() => Store, (store) => store.collection, { cascade: true })
  stores: Store[]
}
