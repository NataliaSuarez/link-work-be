import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';

import { Worker } from './worker.entity';
import { Employer } from './employer.entity';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', unique: true, length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string; // encript

  @Column({ type: 'bool' })
  verified: boolean;

  @Column({ type: 'varchar', length: 255 })
  profileImg: string;

  @Column({ type: 'int' })
  role: number;

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

  @Column({ type: 'varchar', length: 255, nullable: true })
  refreshToken: string;

  @OneToOne(() => Worker, (worker) => worker.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  worker: Worker;

  @OneToOne(() => Employer, (employer) => employer.user, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  employer: Employer;
}
