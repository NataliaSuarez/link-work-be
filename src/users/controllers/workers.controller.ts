import { Body, Controller, Post } from '@nestjs/common';

import { CreateWorkerDto } from '../dtos/workers.dto';
import { WorkersService } from '../services/workers.service';

@Controller('workers')
export class WorkersController {
  constructor(private workersService: WorkersService) {}

  @Post()
  create(@Body() payload: CreateWorkerDto) {
    return this.workersService.create(payload);
  }
}
