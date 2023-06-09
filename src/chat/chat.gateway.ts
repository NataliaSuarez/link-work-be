import * as moment from 'moment';
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
import { UsersService } from '../users/services/users.service';
import { EmployersService } from '../users/services/employers.service';
import { WorkersService } from '../users/services/workers.service';
import { Role } from '../users/entities/user.entity';
import { RoomService } from './room.service';
import { Room } from './room.entity';
import { ShiftsService } from '../offers_and_shifts/services/shifts.service';
import { Shift } from '../offers_and_shifts/entities/shift.entity';
@WebSocketGateway(parseInt(process.env.WS_PORT) || 3000, {
  cors: { origin: '*' },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private chatService: ChatService,
    private roomService: RoomService,
    private userService: UsersService,
    private employersService: EmployersService,
    private workersService: WorkersService,
    private shiftService: ShiftsService,
  ) {}
  @WebSocketServer() server: Server;

  afterInit(server: any) {
    console.log('Esto se ejecuta cuando inicia');
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('Alguien se conecto al socket!');
  }

  handleDisconnect(client: any) {
    console.log('Alguien se fue');
  }

  async getRoomData({
    // shiftId, offerId,
    applicantId,
    employerId,
  }: Room) {
    const roomName = `room_${applicantId}_${employerId}`;
    const employer = await this.employersService.findByUserId(employerId);
    const applicant = await this.workersService.findByUserId(applicantId);
    const lastChat = await this.chatService.getLastChat(roomName);
    const workerShifts = await this.shiftService.findByWorkerUserId(
      applicantId,
    );
    const nextShift = [
      ...workerShifts.acceptedShifts,
      ...workerShifts.activeShifts,
    ].reduce((nextShift: Shift, currShift: Shift) => {
      let result = currShift;
      if (currShift.offer.employerUser.id == employer.id) result = currShift;
      const now: Date = new Date();
      if (moment(currShift.offer.from).isBefore(now)) result = currShift;

      // check for nearlest shift
      if (
        nextShift.offer.employerUser.id == employer.id &&
        moment(nextShift.offer.from).isBefore(now) &&
        moment(nextShift.offer.from).isAfter(currShift.offer.from)
      )
        result = nextShift;

      return result;
    });

    return {
      room: roomName,
      applicant: {
        id: applicantId,
        fullName: applicant.user.firstName + ' ' + applicant.user.lastName,
        profileImg: applicant.user.userImages.find(
          (i) => i.type == 'profileImg',
        )
          ? applicant.user.userImages.find((i) => i.type == 'profileImg').imgUrl
          : '',
        stars: applicant.stars,
        totalReviews: applicant.totalReviews,
      },
      employer: {
        id: employerId,
        fullName: employer.businessName,
        profileImg: employer.user.userImages.find(
          (i) => i.type == 'businessImg',
        )
          ? employer.user.userImages.find((i) => i.type == 'businessImg').imgUrl
          : '',
        stars: employer.stars,
        totalReviews: employer.totalReviews,
      },
      summaryShift: {
        id: nextShift.id,
        from: nextShift.offer.from,
        to: nextShift.offer.to,
        offerId: nextShift.offer.id,
        offerTitle: nextShift.offer.title,
      },
      ...(lastChat
        ? {
            lastMessage: {
              message: lastChat.message,
              createdAt: lastChat.created_at,
            },
          }
        : { lastMessage: null }),
    };
  }

  @SubscribeMessage('event_rooms')
  async handleJoinRooms(client: Socket, userId: string) {
    const user = await this.userService.findOneById(userId);
    client.join(userId);
    const rooms = await this.roomService.getRooms({
      applicantId: user.role == Role.WORKER ? user.id : null,
      employerId: user.role == Role.EMPLOYER ? user.id : null,
    });
    if (!user || rooms.length == 0) return;
    rooms.forEach(async (room: Room) => {
      const data = await this.getRoomData(room);
      client.emit('new_room', data);
      client.emit('room_read', room);
    });
  }

  @SubscribeMessage('event_join_room')
  async handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    const chats = await this.chatService.getChats(room);
    chats.forEach((obj) => {
      const chat: Chat = {
        message: obj.message,
        sender: obj.sender,
        room: obj.room,
        created_at: new Date(obj.created_at),
        receiverRead: obj.receiverRead,
        _id: obj._id,
      };
      client.emit('new_message', chat);
    });
  }

  @SubscribeMessage('event_message')
  async handleIncommingMessage(
    client: Socket,
    payload: {
      room: string;
      applicantId: string;
      employerId: string;
      message: string;
      sender: string;
    },
  ) {
    const { room, message, sender, applicantId, employerId } = payload;
    const chat: Chat = {
      message: message,
      sender: sender,
      room: room,
      created_at: new Date(Date.now()),
      receiverRead: false,
    };
    await this.chatService.saveChat(chat);

    const fullRoom: Room = await this.roomService.getRoom({
      applicantId,
      employerId,
    });
    if (sender == applicantId) {
      fullRoom.employerRead = false;
      fullRoom.applicantRead = true;
    }
    if (sender == employerId) {
      fullRoom.applicantRead = false;
      fullRoom.employerRead = true;
    }
    await this.roomService.saveRoom(fullRoom);
    client.join(sender == applicantId ? applicantId : employerId);
    this.server.emit('room_read', fullRoom);
    this.server.to(room).emit('new_message', chat);
  }

  @SubscribeMessage('event_messages_read')
  async handleReadMessages(
    client: Socket,
    payload: {
      room: string;
      applicantId: string;
      employerId: string;
      userId: string;
    },
  ) {
    const { room, userId, applicantId, employerId } = payload;
    const chats = await this.chatService.getChats(room);
    chats.forEach(async (obj) => {
      if (userId != obj.sender) {
        obj.receiverRead = true;
        await this.chatService.saveChat(obj);
      }
    });
    const fullRoom: Room = await this.roomService.getRoom({
      applicantId,
      employerId,
    });
    if (userId == applicantId) fullRoom.applicantRead = true;
    if (userId == employerId) fullRoom.employerRead = true;
    await this.roomService.saveRoom(fullRoom);
    client.emit('room_read', fullRoom);
  }

  @SubscribeMessage('event_new_room')
  async handleIncommingRoom(
    client: Socket,
    payload: {
      shiftId: string;
      offerId: string;
      applicantId: string;
      employerId: string;
    },
  ) {
    const { shiftId, offerId, applicantId, employerId } = payload;
    const room: Room = {
      // shiftId: shiftId,
      // offerId: offerId,
      applicantId: applicantId,
      employerId: employerId,
    };
    await this.roomService.saveRoom(room);
  }

  @SubscribeMessage('event_leave')
  handleRoomLeave(client: Socket, room: string) {
    client.leave(`room_${room}`);
  }
}
