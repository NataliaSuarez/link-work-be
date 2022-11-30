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

import { Offer } from './offer.entity';
import { Clock } from './clock.entity';
import { User } from 'src/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum ShiftStatus {
  CREATED = 0,
  ACTIVE = 1,
  DONE = 2,
  CANCELED = 3,
  UNCONFIRMED = 4,
}

@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  @ApiProperty({ nullable: true })
  autoConfirmed: Date;

  @Column({
    type: 'enum',
    enum: ShiftStatus,
    default: ShiftStatus.CREATED,
  })
  status: ShiftStatus;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  workerUser: User;

  @OneToOne(() => Offer, (offer) => offer.shift, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'offerId' })
  offer: Offer;

  @OneToMany(() => Clock, (clocks) => clocks.shift, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  clocksHistory: Clock[];
}
