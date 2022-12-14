import {
  InferSubjects,
  Ability,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { Offer } from '../../offers_and_shifts/entities/offer.entity';
import { Shift } from '../../offers_and_shifts/entities/shift.entity';
import { UserImage } from '../../users/entities/user_image.entity';
import { EmployerData } from '../../users/entities/employer_data.entity';
import { Role, User } from '../../users/entities/user.entity';
import { WorkerData } from '../../users/entities/worker_data.entity';

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export type Subjects =
  | InferSubjects<
      | typeof User
      | typeof Offer
      | typeof Shift
      | typeof EmployerData
      | typeof WorkerData
      | typeof UserImage
    >
  | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
  defineAbility(user: User) {
    const { can, build } = new AbilityBuilder(
      Ability as AbilityClass<AppAbility>,
    );

    if (user.role === Role.EMPLOYER) {
      can([Action.Read, Action.Update], User);
      can([Action.Manage], Offer);
      can([Action.Manage], Shift);
      can([Action.Create, Action.Read, Action.Update], EmployerData);
      can([Action.Read], WorkerData);
      can([Action.Manage], UserImage);
    }
    if (user.role === Role.WORKER) {
      can([Action.Read, Action.Update], User);
      can([Action.Read], Offer);
      can([Action.Read], Shift);
      can([Action.Create, Action.Read, Action.Update], WorkerData);
      can([Action.Read], EmployerData);
      can([Action.Manage], UserImage);
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
