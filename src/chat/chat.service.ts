import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from '@m8a/nestjs-typegoose';

import { Chat } from './chat.entity';

type Room = { room: string; userId: string };

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat) private readonly chatModel: ReturnModelType<typeof Chat>,
  ) {}

  async getChats(room): Promise<Chat[]> {
    return await this.chatModel.find({ room: room });
  }

  async getLastChat(room): Promise<Chat> {
    const chats = await this.chatModel.find({
      room: room,
      options: { sort: { created_at: -1 } },
    });
    return chats[chats.length - 1];
  }

  async getRooms(): Promise<Room[]> {
    const all = await this.chatModel.find();
    return all.reduce((rooms, chat, i) => {
      if (rooms.includes(chat.room)) return rooms;
      return [...rooms, { room: chat.room, userId: chat.sender }];
    }, []);
  }

  async saveChat(chat: Chat): Promise<void> {
    const createdChat = new this.chatModel(chat);
    await createdChat.save();
  }
}
