import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../users/entities/user.entity';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { Support } from './entities/support.entity';
import { UsersService } from 'src/users/services/users.service';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { UserImage } from 'src/users/entities/user_image.entity';
import { DOSpacesService } from 'src/spaces/services/doSpacesService';
import { DOSpacesServiceProvider } from 'src/spaces/services';

@Module({
  imports: [TypeOrmModule.forFeature([User, Support, UserImage])],
  controllers: [SupportController],
  providers: [
    SupportService,
    UsersService,
    SendgridService,
    DOSpacesService,
    DOSpacesServiceProvider,
  ],
})
export class SupportModule {}
