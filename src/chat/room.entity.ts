import { prop } from '@typegoose/typegoose';

export class Room {
  @prop({
    required: [true, 'Shift ID is required'],
  })
  shiftId: string;

  @prop({
    required: [true, 'Offer ID is required'],
  })
  offerId: string;

  @prop({
    required: [true, 'Applicant ID is required'],
  })
  applicantId: string;

  @prop({
    required: [true, 'Employer ID is required'],
  })
  employerId: string;

  constructor(room?: Partial<Room>) {
    Object.assign(this, room);
  }
}
