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
      address: '90 Sage Junction',
      city: 'New York City',
      state: 'New York',
      age: 60,
      gender: 1,
      description: 'Lorem ipsum lorem ipsum lorem ipsum',
      ssn: 4546415,
      stars: 4,
      totalReviews: 15,
      stripeId: '',
      user: {
        id: 1,
        firstName: 'Selie',
        lastName: 'Corbould',
        email: 'scorbould0@who.int',
        password: 'string',
        verified: true,
        profileImg: 'http://dummyimage.com/220x100.png/ff4444/ffffff',
        role: 2,
      },
    };

    const data2 = {
      address: '362 Oxford Alley',
      city: 'Oakland',
      state: 'California',
      age: 37,
      gender: 2,
      description: 'Lorem ipsum lorem ipsum lorem ipsum',
      ssn: 534534534,
      stars: 5,
      totalReviews: 8,
      stripeId: '',
      user: {
        id: 2,
        firstName: 'Guntar',
        lastName: 'Donnett',
        email: 'gdonnett1@oaic.gov.au',
        password: '0iOQpild',
        verified: true,
        profileImg: 'http://dummyimage.com/102x100.png/cc0000/ffffff',
        role: 2,
      },
    };

    const data3 = {
      address: '1 Algoma Park',
      city: 'Raleigh',
      state: 'North Carolina',
      age: 21,
      gender: 2,
      description: 'Lorem ipsum lorem ipsum lorem ipsum',
      ssn: 43535345,
      stars: 2,
      totalReviews: 11,
      stripeId: '',
      user: {
        id: 6,
        firstName: 'Thomas',
        lastName: 'Jenkins',
        email: 'tj44@rediff.com',
        password: '1XfFsmtfPzsZG',
        verified: false,
        profileImg: 'http://dummyimage.com/123x120.png/ff4444/ffffff',
        role: 2,
      },
    };

    const data4 = {
      address: '69 Dennis Drive',
      city: 'Newark',
      state: 'New Jersey',
      age: 32,
      gender: 2,
      description: 'Lorem ipsum lorem ipsum lorem ipsum',
      ssn: 2752777,
      stars: 5,
      totalReviews: 7,
      stripeId: '',
      user: {
        id: 7,
        firstName: 'Christian',
        lastName: 'Davids',
        email: 'tj4ds4@rediff.com',
        password: '1XfFsmtfdPzsZG',
        verified: true,
        profileImg: 'http://dummyimage.com/123x120.png/ff4444/ffffff',
        role: 2,
      },
    };

    const data5 = {
      address: '41879 Mosinee Place',
      city: 'Fresno',
      state: 'California',
      age: 22,
      gender: 2,
      description: 'Lorem ipsum lorem ipsum lorem ipsum',
      ssn: 87734538,
      stars: 4,
      totalReviews: 4,
      stripeId: '',
      user: {
        id: 8,
        firstName: 'Thomas',
        lastName: 'Jones',
        email: 'tdasj44@rediff.com',
        password: '1XfFsmtfPzsZG',
        verified: true,
        profileImg: 'http://dummyimage.com/123x120.png/ff4444/ffffff',
        role: 2,
      },
    };

    const register1 = await workerRepository.findOneBy({ id: 1 });
    const register2 = await workerRepository.findOneBy({ id: 2 });
    const register3 = await workerRepository.findOneBy({ id: 3 });
    const register4 = await workerRepository.findOneBy({ id: 4 });
    const register5 = await workerRepository.findOneBy({ id: 5 });

    if (!register1) {
      const new1 = workerRepository.create(data1);
      await workerRepository.save(new1);
    }

    if (!register2) {
      const new2 = workerRepository.create(data2);
      await workerRepository.save(new2);
    }

    if (!register3) {
      const new3 = workerRepository.create(data3);
      await workerRepository.save(new3);
    }

    if (!register4) {
      const new4 = workerRepository.create(data4);
      await workerRepository.save(new4);
    }

    if (!register5) {
      const new5 = workerRepository.create(data5);
      await workerRepository.save(new5);
    }
  }
}
