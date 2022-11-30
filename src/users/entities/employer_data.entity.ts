import { ApiProperty } from '@nestjs/swagger';
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

export enum BusinessCode {
  HOTEL = 0,
  RESTAURANT = 1,
  OTHER = 2,
}

@Entity('employers_data')
export class EmployerData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: BusinessCode,
    default: BusinessCode.OTHER,
  })
  businessCode: BusinessCode;

  @Column({ type: 'varchar', length: 255 })
  businessName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty({ nullable: true })
  businessUrl: string;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({ nullable: true })
  description: string;

  @Column({ type: 'float', default: 0 })
  stars: number;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column({ type: 'float', default: 0 })
  avgStars: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty({ nullable: true })
  lastFour: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty({ nullable: true })
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

  @OneToOne(() => User, (user) => user.employerData, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
}
