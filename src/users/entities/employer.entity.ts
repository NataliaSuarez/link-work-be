import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { User } from './user.entity';
import { Offer } from '../../offers_and_shifts/entities/offer.entity';
import { BusinessImages } from './businessImg.entity';

export enum BusinessCode {
  HOTEL = 0,
  RESTAURANT = 1,
  OTHER = 2,
}

@Entity('employers')
export class Employer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: BusinessCode,
    default: BusinessCode.OTHER,
  })
  businessCode: BusinessCode;

  @Column({ type: 'varchar', length: 255 })
  businessName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  businessUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'float', default: 0 })
  stars: number;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column({ type: 'float', default: 0 })
  avgStars: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  customerId: string;

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

  @OneToOne(() => User, (user) => user.employer, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Offer, (offers) => offers.employer)
  offers: Offer[];

  @OneToMany(
    () => BusinessImages,
    (businessImages) => businessImages.employer,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  businessImages: BusinessImages[];
}
