import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { Worker } from './worker.entity';
import { Employer } from './employer.entity';

export enum RegisterType {
  MAIL_AND_PASSWORD = 0,
  GOOGLE = 1,
  APPLE = 2,
}

export enum Role {
  EMPLOYER = 1,
  WORKER = 2,
}

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

  @Column({ nullable: true })
  @Exclude()
  password?: string;

  @Column({
    type: 'enum',
    enum: RegisterType,
    default: RegisterType.MAIL_AND_PASSWORD,
  })
  registerType: RegisterType;

  @Column({ type: 'bool', default: false })
  verified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImg?: string;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role: Role;

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
