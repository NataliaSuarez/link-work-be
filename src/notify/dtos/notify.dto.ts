import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class FcmTokenDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly fcmIdentityToken: string;
}

export class DataDto {
  @IsOptional()
  @IsUUID()
  @ApiProperty()
  entityId: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  path: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  argsType: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  redirect: string;
}

export class NotificationDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  body: string;
}

export class FullNotificationDto {
  @IsOptional()
  @IsObject()
  @ApiProperty()
  data: DataDto;

  @IsNotEmpty()
  @IsObject()
  @ApiProperty()
  notification: NotificationDto;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  token: string;

  @IsNotEmpty()
  @IsObject()
  @ApiProperty()
  android: {
    priority: string;
  };

  @IsNotEmpty()
  @IsObject()
  @ApiProperty()
  apns: {
    payload: {
      aps: { contentAvailable: boolean };
      headers: {
        'apns-push-type': string;
        'apns-priority': string;
        'apns-topic': string;
      };
    };
  };
}
