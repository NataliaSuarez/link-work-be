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

  @Column({ type: 'int', default: 0 })
  status: number;

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
