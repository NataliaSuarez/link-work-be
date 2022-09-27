import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from '@m8a/nestjs-typegoose';

import { Chat } from './chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat) private readonly chatModel: ReturnModelType<typeof Chat>,
  ) {}

  async getChats(room): Promise<Chat[]> {
    return await this.chatModel.find({ room: room });
  }

  async saveChat(chat: Chat): Promise<void> {
    const createdChat = new this.chatModel(chat);
    await createdChat.save();
  }
}
