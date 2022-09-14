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

import { Users } from './users.entity';
import { Offers } from '../../offers/entities/offers.entity';

@Entity('employer')
export class Employer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  businessCode: number;

  @Column({ type: 'varchar', length: 255 })
  businessName: string;

  @Column({ type: 'text' })
  description: string;

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

  @OneToOne(() => Users, (user) => user.employer, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: Users;

  @OneToMany(() => Offers, (offers) => offers.employer)
  offers: Offers[];
}
