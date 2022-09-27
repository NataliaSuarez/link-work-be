import { prop } from '@typegoose/typegoose';

export class Chat {
  @prop({
    required: [true, 'Message is required'],
  })
  message: string;

  @prop({
    required: [true, 'Sender is required'],
  })
  sender: string;

  @prop({
    required: [true, 'Room is required'],
  })
  room: string;

  constructor(chat?: Partial<Chat>) {
    Object.assign(this, chat);
  }
}
