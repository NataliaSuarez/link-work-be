import { Controller, Get, UseGuards, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppleService } from './apple.service';

@Controller('/apple')
export class AppleController {
  constructor(private sService: AppleService) {}
  @Get()
  @UseGuards(AuthGuard('apple'))
  async login(): Promise<any> {
    try {
      return HttpStatus.OK;
    } catch (error) {
      return error;
    }
  }
}
