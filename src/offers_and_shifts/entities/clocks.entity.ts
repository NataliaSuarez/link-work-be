import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { Shift } from './shift.entity';
import { Users } from '../../users/entities/users.entity';

export enum ClockType {
  IN = 1,
  OUT = 2,
}

@Entity('clocks_history')
export class Clocks {
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

  @Column({
    type: 'enum',
    enum: ClockType,
  })
  clockType: ClockType;

  @ManyToOne(() => Shift, (shift) => shift.clocksHistory, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  shift: Shift;

  @ManyToOne(() => Users, (user) => user.clocksHistory, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: Users;
}
