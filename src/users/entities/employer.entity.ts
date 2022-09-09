import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { Users } from './users.entity';

@Entity()
export class Employer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  businessCode: number;

  @Column({ type: 'varchar', length: 255 })
  businessName: string;

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
  })
  @JoinColumn({ name: 'userId' })
  user: Users;
}
