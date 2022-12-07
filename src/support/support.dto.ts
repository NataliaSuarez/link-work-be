import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SupportDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  msg: string;
}
