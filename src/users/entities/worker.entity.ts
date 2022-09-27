import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';

import { Users } from './users.entity';
import { Offers } from '../../offers/entities/offers.entity';
import { Shift } from '../../offers/entities/shift.entity';
import { Experience } from './experience.entity';

@Entity('worker')
export class Worker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 255 })
  city: string;

  @Column({ type: 'varchar', length: 255 })
  state: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'int' })
  gender: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  ssn: number;

  @Column({ type: 'int' })
  stars: number;

  @Column({ type: 'int' })
  totalReviews: number;

  @Column({ type: 'varchar', length: 255 })
  stripeId: string;

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

  @OneToOne(() => Users, (user) => user.worker, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ManyToMany(() => Offers, (offers) => offers.applicants, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable()
  offers: Offers[];

  @OneToMany(() => Shift, (shift) => shift.worker, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  shifts: Shift[];

  @OneToMany(() => Experience, (experience) => experience.worker, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  experience: Experience[];
}
