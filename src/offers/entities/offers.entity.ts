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

@Entity('offer')
export class Offers {
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

  @Column({ type: 'int' })
  category: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int', default: 0 })
  status: number;

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
  })
  employer: Employer;

  @OneToOne(() => Shift, (shift) => shift.offer, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  shift: Shift;
}
