import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { ChatService } from './chat.service';
import { Chat } from './chat.entity';

@WebSocketGateway(81, {
  cors: { origin: '*' },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private chatService: ChatService) {}
  @WebSocketServer() server: Server;

  afterInit(server: any) {
    console.log('Esto se ejecuta cuando inicia');
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('Alguien se conecto al socket');
  }

  handleDisconnect(client: any) {
    console.log('Alguien se fue');
  }

  @SubscribeMessage('event_join')
  async handleJoinRoom(client: Socket, room: string) {
    client.join(`room_${room}`);
    const chats = await this.chatService.getChats(room);
    chats.forEach((obj) => {
      console.log(obj.message, obj.sender);
      client.emit('new_message', obj.message);
    });
  }

  @SubscribeMessage('event_message')
  async handleIncommingMessage(
    client: Socket,
    payload: { room: string; message: string },
  ) {
    const { room, message } = payload;
    const chat: Chat = {
      message: message,
      sender: client.id,
      room: room,
    };
    console.log(chat);
    await this.chatService.saveChat(chat);

    this.server.to(`room_${room}`).emit('new_message', message);
  }

  @SubscribeMessage('event_leave')
  handleRoomLeave(client: Socket, room: string) {
    console.log(`salida de sala: ${room}`);
    client.leave(`room_${room}`);
  }
}
