import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { Worker } from '../../users/entities/worker.entity';

export class WorkerSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const workerRepository = dataSource.getRepository(Worker);

    const data1 = {
      age: 60,
      stars: 4,
      totalReviews: 15,
      user: {
        id: 1,
        firstName: 'Selie',
        lastName: 'Corbould',
        address: '41879 Mosinee Place',
        city: 'Fresno',
        state: 'California',
        email: 'scorbould0@who.int',
        password: 'dK9M0lPxu',
        profileImg: 'http://dummyimage.com/220x100.png/ff4444/ffffff',
        role: 2,
      },
    };
    const data2 = {
      age: 37,
      stars: 5,
      totalReviews: 8,
      user: {
        id: 2,
        firstName: 'Guntar',
        lastName: 'Donnett',
        address: '90 Sage Junction',
        city: 'New York City',
        state: 'New York',
        email: 'gdonnett1@oaic.gov.au',
        password: '0iOQpild',
        profileImg: 'http://dummyimage.com/102x100.png/cc0000/ffffff',
        role: 2,
      },
    };
    const data3 = {
      age: 21,
      stars: 2,
      totalReviews: 11,
      user: {
        id: 6,
        firstName: 'Thomas',
        lastName: 'Jenkins',
        address: '321 Privet Drive',
        city: 'Miami',
        state: 'Florida',
        email: 'tj44@rediff.com',
        password: '1XfFsmtfPzsZG',
        profileImg: 'http://dummyimage.com/123x120.png/ff4444/ffffff',
        role: 2,
      },
    };

    const new1 = workerRepository.create(data1);
    await workerRepository.save(new1);

    const new2 = workerRepository.create(data2);
    await workerRepository.save(new2);

    const new3 = workerRepository.create(data3);
    await workerRepository.save(new3);
  }
}
