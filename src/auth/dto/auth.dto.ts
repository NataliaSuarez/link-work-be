import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  readonly email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly password?: string;
}

export class RetrievePasswordDto {
  @IsString()
  @IsNotEmpty()
  readonly newPassword: string;

  @IsString()
  @IsNotEmpty()
  readonly repeatNewPassword: string;

  @IsString()
  @IsNotEmpty()
  readonly retrieveToken: string;
}
