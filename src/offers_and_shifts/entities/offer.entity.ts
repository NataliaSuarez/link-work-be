import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToMany,
  OneToOne,
  ManyToOne,
  JoinTable,
} from 'typeorm';

import { Shift } from './shift.entity';
import { User } from 'src/users/entities/user.entity';

export enum OfferStatus {
  CREATED = 0,
  ACCEPTED = 1,
  DONE = 2,
  CANCELED = 3,
}

export enum OfferCategory {
  CLEANING = 0,
  WAITING = 1,
  RECEPTION = 2,
  TECHNICIAN = 3,
  OTHER = 4,
}

@Entity('offers')
export class Offer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({
    type: 'enum',
    enum: OfferCategory,
  })
  category: OfferCategory;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  videoUrl?: string;

  @Column({
    type: 'enum',
    enum: OfferStatus,
    default: OfferStatus.CREATED,
  })
  status: OfferStatus;

  @Column({ type: 'int', default: 0 })
  applicantsCount: number;

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

  @ManyToMany(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'offers_applicants' })
  applicants: User[];

  @ManyToMany(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinTable({ name: 'workers_offers_favorites' })
  favoritedBy: User[];

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
    cascade: true,
    eager: true,
  })
  employerUser: User;

  @OneToOne(() => Shift, (shift) => shift.offer, {
    nullable: true,
  })
  shift: Shift;
}
