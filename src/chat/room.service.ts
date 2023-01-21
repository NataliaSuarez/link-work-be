import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from '@m8a/nestjs-typegoose';

import { Room } from './room.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room) private readonly roomModel: ReturnModelType<typeof Room>,
  ) {}

  async getRooms(payload: {
    applicantId: string | null;
    employerId: string | null;
  }): Promise<Room[]> {
    const { applicantId, employerId } = payload;
    if (applicantId)
      return await this.roomModel.find({
        applicantId: applicantId,
      });
    if (employerId)
      return await this.roomModel.find({
        employerId: employerId,
      });
  }

  async saveRoom(room: Room): Promise<void> {
    const hasRoom = await this.roomModel.findOne({
      applicantId: room.applicantId,
      employerId: room.employerId,
    });
    if (hasRoom) return;
    const createdRoom = new this.roomModel(room);
    await createdRoom.save();
  }
}
