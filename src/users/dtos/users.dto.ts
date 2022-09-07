export class CreateUserDto {
  readonly address: string;
  readonly city: string;
  readonly state: string;
  readonly email: string;
  readonly password: string;
  readonly profileImg: string;
  readonly role: number;
}

export class UpdateUserDto {
  readonly address?: string;
  readonly city?: string;
  readonly state?: string;
  readonly email?: string;
  readonly password?: string;
  readonly profileImg?: string;
  readonly role?: number;
}
