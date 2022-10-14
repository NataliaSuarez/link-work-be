import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToMany,
  OneToOne,
  ManyToOne,
} from 'typeorm';

import { Worker } from '../../users/entities/worker.entity';
import { Employer } from '../../users/entities/employer.entity';
import { Shift } from './shift.entity';

export enum Status {
  CREATED = 0,
  ACCEPTED = 1,
  DONE = 2,
  CANCELLED = 3,
}

export enum Category {
  LIMPIEZA = 0,
  MESERO = 1,
  RECEPCION = 2,
  TECNICO = 3,
  OTHER = 4,
}

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'timestamptz' })
  from: Date;

  @Column({ type: 'timestamptz' })
  to: Date;

  @Column({ type: 'int' })
  usdHour: number;

  @Column({ type: 'int' })
  usdTotal: number;

  @Column({
    type: 'enum',
    enum: Category,
  })
  category: Category;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.CREATED,
  })
  status: Status;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updateAt: Date;

  @ManyToMany(() => Worker, (applicants) => applicants.offers, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  applicants: Worker[];

  @ManyToOne(() => Employer, (employer) => employer.offers, {
    nullable: false,
    onDelete: 'CASCADE',
    cascade: true,
    eager: true,
  })
  employer: Employer;

  @OneToOne(() => Shift, (shift) => shift.offer, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  shift: Shift;
}
