import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

export enum ImageType {
  PROFILE_IMG = 'profileImg',
  ID_FRONT_IMG = 'idFrontImg',
  ID_BACK_IMG = 'idBackImg',
  SIGNATURE_IMG = 'signatureImg',
  BUSINESS_IMG = 'businessImg',
}

@Entity('user_images')
export class UserImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  imgUrl: string;

  @Column({
    type: 'enum',
    enum: ImageType,
  })
  type: ImageType;

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

  @ManyToOne(() => User, (user) => user.userImages, {
    nullable: false,
  })
  user: User;
}
