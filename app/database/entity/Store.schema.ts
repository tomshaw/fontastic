import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from "typeorm";
import { Collection } from "./Collection.schema"

export type StoreManyAndCountType = Array<Store[] | number>;

@Entity()
export class Store {

  @PrimaryGeneratedColumn()
  id: number;

  @Column("int")
  collection_id: number;

  @Column({ type: "varchar", length: 255, default: "", nullable: true })
  file_name: string;

  @Column({ type: "text", nullable: true })
  file_path: string;

  @Column({ type: "int", default: 0, nullable: true })
  file_size: number;

  @Column({ type: "text", nullable: true })
  file_size_pretty: string;

  @Column({ type: "text", nullable: true })
  file_type: string;

  @Column({ type: "smallint", default: 0, nullable: true })
  @Index()
  installable: number;

  @Column({ type: "smallint", default: 0, nullable: true })
  @Index()
  activated: number;

  @Column({ type: "smallint", default: 0, nullable: true })
  @Index()
  temporary: number;

  @Column({ type: "smallint", default: 0, nullable: true })
  @Index()
  favorite: number;

  @Column({ type: "smallint", default: 0, nullable: true })
  @Index()
  system: number;

  @Column({ type: "text", nullable: true })
  compatible_full_name: string;

  @Column({ type: "text", nullable: true })
  copyright: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "text", nullable: true })
  designer: string;

  @Column({ type: "text", nullable: true })
  designer_url: string;

  @Column({ type: "text", nullable: true })
  font_family: string;

  @Column({ type: "text", nullable: true })
  font_subfamily: string;

  @Column({ type: "text", nullable: true })
  full_name: string;

  @Column({ type: "text", nullable: true })
  license: string;

  @Column({ type: "text", nullable: true })
  license_url: string;

  @Column({ type: "text", nullable: true })
  manufacturer: string;

  @Column({ type: "text", nullable: true })
  manufacturer_url: string;

  @Column({ type: "text", nullable: true })
  post_script_name: string;

  @Column({ type: "text", nullable: true })
  preferred_family: string;

  @Column({ type: "text", nullable: true })
  preferred_sub_family: string;

  @Column({ type: "text", nullable: true })
  sample_text: string;

  @Column({ type: "text", nullable: true })
  trademark: string;

  @Column({ type: "text", nullable: true })
  unique_id: string;

  @Column({ type: "text", nullable: true })
  version: string;

  @CreateDateColumn() public created: Date;
  @UpdateDateColumn() public updated: Date;

  @ManyToOne(() => Collection, (model) => model.stores, { 
    onDelete: 'CASCADE' 
  })

  @JoinColumn({ name: "collection_id" })
  collection: Collection;
}
