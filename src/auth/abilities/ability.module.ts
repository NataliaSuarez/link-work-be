import { Global, Module } from '@nestjs/common';
import { AbilitiesGuard } from './abilities.guard';
import { AbilityFactory } from './ability.factory';

@Global()
@Module({
  providers: [AbilityFactory, AbilitiesGuard],
  exports: [AbilityFactory],
})
export class AbilityModule {}
