import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Store } from './Store.schema';

@Entity()
@Index(['left_id', 'right_id'])
@Index(['parent_id'])
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
  })
  title: string;

  @Column({
    type: 'int',
    default: 0,
  })
  parent_id: number;

  @Column({
    type: 'smallint',
    default: 0,
  })
  left_id: number;

  @Column({
    type: 'smallint',
    default: 0,
  })
  right_id: number;

  @Column({
    type: 'smallint',
    default: 0,
  })
  count: number;

  @Column({
    type: 'smallint',
    default: 0,
  })
  is_system: number;

  @Column({
    type: 'smallint',
    default: 0,
  })
  orderby: number;

  @Column({
    type: 'smallint',
    default: 0,
  })
  enabled: boolean;

  @Column({
    type: 'smallint',
    default: 0,
  })
  collapsed: boolean;

  @CreateDateColumn() public created: Date;
  @UpdateDateColumn() public updated: Date;

  @OneToMany(() => Store, (store) => store.collection, { cascade: true })
  stores: Store[];
}
