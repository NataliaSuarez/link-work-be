import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

//import { from, Observable } from 'rxjs';

import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /* add(user: UserI): Observable<UserI> {
    return from(this.userRepository.save(user));
  }

  findAll(): Observable<UserI[]> {
    return from(this.userRepository.find());
  }*/
}
