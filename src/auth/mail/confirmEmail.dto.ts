import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class ConfirmEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class EmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
