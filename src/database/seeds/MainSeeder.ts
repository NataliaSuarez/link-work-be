import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager, runSeeder } from 'typeorm-extension';

import { UserSeeder } from './UserSeeder';
import { WorkerSeeder } from './WorkerSeeder';
import { EmployerSeeder } from './EmployerSeeder';
import { OfferSeeder } from './OfferSeeder';
import { ShiftSeeder } from './ShiftSeeder';

export class MainSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    await runSeeder(dataSource, UserSeeder);
    await runSeeder(dataSource, WorkerSeeder);
    await runSeeder(dataSource, EmployerSeeder);
    await runSeeder(dataSource, OfferSeeder);
    await runSeeder(dataSource, ShiftSeeder);
  }
}
