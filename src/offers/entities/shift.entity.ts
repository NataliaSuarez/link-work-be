import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { Offers } from './offers.entity';
import { Worker } from '../../users/entities/worker.entity';

export enum Status {
  ACCEPTED = 0,
  ACTIVE = 1,
  DONE = 2,
  CANCELLED = 3,
}

@Entity('shift')
export class Shift {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ type: 'bool', default: false })
  clockIn: boolean;

  @Column({ type: 'bool', default: false })
  clockOut: boolean;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACCEPTED,
  })
  status: Status;

  @ManyToOne(() => Worker, (worker) => worker.shifts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  worker: Worker;

  @OneToOne(() => Offers, (offer) => offer.shift, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'offerId' })
  offer: Offers;
}
