import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Offers } from './offers.entity';
import { Worker } from '../../users/entities/worker.entity';
import { Clocks } from './clocks.entity';

export enum Status {
  ACCEPTED = 0,
  ACTIVE = 1,
  DONE = 2,
  CANCELLED = 3,
  UNCONFIRMED = 4,
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
  confirmedClockIn: boolean;

  @Column({ type: 'bool', default: false })
  clockOut: boolean;

  @Column({ type: 'bool', default: false })
  confirmedClockOut: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  autoConfirmed: Date;

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

  @OneToMany(() => Clocks, (clocks) => clocks.shift, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  clocksHistory: Clocks[];
}
