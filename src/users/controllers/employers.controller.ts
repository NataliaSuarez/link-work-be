import { Body, Controller, Post } from '@nestjs/common';

import { CreateEmployerDto } from '../dtos/employers.dto';
import { EmployersService } from '../services/employers.service';

@Controller('employers')
export class EmployersController {
  constructor(private employersService: EmployersService) {}

  @Post()
  create(@Body() payload: CreateEmployerDto) {
    return this.employersService.create(payload);
  }
}
