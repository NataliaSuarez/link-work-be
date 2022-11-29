import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';
import { Offer } from '../../offers_and_shifts/entities/offer.entity';
@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ type: 'varchar', length: 255, nullable: false })
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  city: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  state: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  postalCode: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  lat: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  long: string;

  @Column({ type: 'bool', nullable: false })
  principal: boolean;

  @ManyToOne(() => User, (user) => user.address, {
    nullable: false,
  })
  user: User;

  @OneToMany(() => Offer, (offer) => offer.address)
  addressOffers: Offer[];
}
