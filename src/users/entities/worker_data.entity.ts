import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from './user.entity';
import { WorkerExperience } from './worker_experience.entity';

export enum Gender {
  FEMALE = 0,
  MALE = 1,
  OTHER = 2,
}

@Entity('workers_data')
export class WorkerData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  dayOfBirth: number;

  @Column({ type: 'int' })
  monthOfBirth: number;

  @Column({ type: 'int' })
  yearOfBirth: number;

  @Column({ type: 'varchar', length: 255 })
  phone: string;

  @Column({ type: 'varchar', length: 255 })
  personalUrl: string;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  ssn: number;

  @Column({ type: 'float', default: 0 })
  stars: number;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column({ type: 'float', default: 0 })
  avgStars: number;

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

  @OneToOne(() => User, (user) => user.workerData, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToOne(() => WorkerExperience, (experience) => experience.workerUser, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workerId' })
  experience: WorkerExperience;
}
