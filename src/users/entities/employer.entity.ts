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

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 255 })
  city: string;

  @Column({ type: 'varchar', length: 255 })
  state: string;

  @Column({
    type: 'enum',
    enum: BusinessCode,
    default: BusinessCode.OTHER,
  })
  businessCode: BusinessCode;

  @Column({ type: 'varchar', length: 255 })
  businessName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  stars: number;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

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
