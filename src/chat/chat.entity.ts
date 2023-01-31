import { AutoIncrementID } from '@typegoose/auto-increment';
import { plugin, prop } from '@typegoose/typegoose';

@plugin(AutoIncrementID, {})
export class Chat {
  @prop()
  public _id?: number;

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

  @prop({
    default: () => Date.now(),
  })
  created_at: Date;

  @prop({
    default: () => false,
  })
  receiverRead: boolean;

  constructor(chat?: Partial<Chat>) {
    Object.assign(this, chat);
  }
}
