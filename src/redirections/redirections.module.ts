import { Module } from '@nestjs/common';
import { RedirectionsController } from './redirections.controller';

@Module({
  controllers: [RedirectionsController],
})
export class RedirectionsModule {}
