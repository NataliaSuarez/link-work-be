import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  DeleteDateColumn,
  ManyToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { WorkerData } from './worker_data.entity';
import { EmployerData } from './employer_data.entity';
import { Clock } from '../../offers_and_shifts/entities/clock.entity';
import { Offer } from 'src/offers_and_shifts/entities/offer.entity';
import { Shift } from 'src/offers_and_shifts/entities/shift.entity';
import { EmployerBusinessImage } from './employer_business_image.entity';
import { WorkerExperience } from './worker_experience.entity';
import { Address } from './address.entity';

export enum RegisterType {
  EMAIL_AND_PASSWORD = 0,
  GOOGLE = 1,
  APPLE = 2,
}

export enum Role {
  UNASSIGNED = 0,
  EMPLOYER = 1,
  WORKER = 2,
}

export enum ProfileStatus {
  INCOMPLETE = 0,
  COMPLETE = 1,
  CARD_PENDING = 2,
  BANK_PENDING = 3,
}

export enum BlockedReason {
  NO_BLOCKED = 0,
  MULTIPLE_LOGIN_ATTEMPTS = 1,
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName: string;

  @Column({ type: 'varchar', unique: true, length: 255 })
  email: string;

  @Column({ nullable: true, select: false })
  @Exclude()
  password?: string;

  @Column({
    type: 'enum',
    enum: RegisterType,
    default: RegisterType.EMAIL_AND_PASSWORD,
  })
  registerType: RegisterType;

  @Column({ type: 'bool', default: false })
  verified: boolean;

  @Column({ type: 'bool', default: false })
  blocked: boolean;

  @Column({
    type: 'enum',
    enum: BlockedReason,
    default: BlockedReason.NO_BLOCKED,
  })
  blockedReason: BlockedReason;

  @Column({ type: 'int', default: 0 })
  failedAttemptsToLogin: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImg?: string;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role: Role;

  @Column({
    type: 'enum',
    enum: ProfileStatus,
    default: ProfileStatus.INCOMPLETE,
  })
  profileStatus: ProfileStatus;

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

  @DeleteDateColumn()
  desactivatedAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  retrieveToken: string;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  refreshToken: string;

  @OneToOne(() => WorkerData, (worker) => worker.user, {
    nullable: true,
    eager: true,
    cascade: true,
  })
  workerData: WorkerData;

  @ManyToMany(() => Offer, (offer) => offer.applicants)
  offersAppliedToByWorker: Offer[];

  @ManyToMany(() => Offer, (offer) => offer.favoritedBy)
  workerFavoriteOffers: Offer[];

  @OneToMany(() => Shift, (shift) => shift.workerUser)
  workerShifts: Shift[];

  @OneToOne(() => WorkerExperience, (exp) => exp.workerUser)
  workerExperience: WorkerExperience;

  @OneToOne(() => EmployerData, (employer) => employer.user, {
    nullable: true,
    eager: true,
    cascade: true,
  })
  employerData: EmployerData;

  @OneToMany(() => Offer, (offer) => offer.employerUser)
  offersOwnedByEmployer: Offer[];

  @OneToMany(() => EmployerBusinessImage, (img) => img.employerUser)
  employerBusinessImages: EmployerBusinessImage[];

  @OneToMany(() => Clock, (clocks) => clocks.user, {
    nullable: true,
  })
  clocksHistory: Clock[];

  @OneToMany(() => Address, (address) => address.user, {
    eager: true,
    cascade: true,
  })
  address: Address[];
}
