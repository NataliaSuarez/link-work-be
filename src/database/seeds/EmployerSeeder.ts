import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { Employer } from '../../users/entities/employer.entity';

export class EmployerSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const employerRepository = dataSource.getRepository(Employer);

    const data1 = {
      address: '546 Douglas Street',
      city: 'Miami',
      state: 'Florida',
      businessName: 'Jacobi Group',
      businessCode: 0,
      description: 'Lorem ipsum lorem ipsum lorem ipsum',
      stars: 4,
      totalReviews: 15,
      customerId: '',
      user: {
        id: 3,
        firstName: 'Atalanta',
        lastName: 'Pitts',
        email: 'apitts2@uiuc.edu',
        password: 'Ng5AUZ',
        verified: true,
        profileImg: 'http://dummyimage.com/147x100.png/5fa2dd/ffffff',
        role: 1,
      },
    };

    const data2 = {
      address: '44 Douglas Street',
      city: 'Miami',
      state: 'Florida',
      businessName: 'Wilkinson Group',
      businessCode: 1,
      description: 'Lorem ipsum lorem ipsum lorem ipsum',
      stars: 3,
      totalReviews: 50,
      customerId: '',
      user: {
        id: 4,
        firstName: 'Chester',
        lastName: 'Sussems',
        email: 'csussems3@nifty.com',
        password: '1TBZtiRo',
        verified: false,
        profileImg: 'http://dummyimage.com/176x100.png/dddddd/000000',
        role: 1,
      },
    };

    const data3 = {
      address: '321 Privet Drive',
      city: 'Miami',
      state: 'Florida',
      businessName: 'Carroll Inc',
      businessCode: 2,
      description: 'Lorem ipsum lorem ipsum lorem ipsum',
      stars: 5,
      totalReviews: 2,
      customerId: '',
      user: {
        id: 5,
        firstName: 'Timofei',
        lastName: 'Dawks',
        email: 'tdawks4@rediff.com',
        password: '1xNfXFmtPzZG',
        verified: true,
        profileImg: 'http://dummyimage.com/113x100.png/ff4444/ffffff',
        role: 1,
      },
    };

    const register1 = await employerRepository.findOneBy({ id: 1 });
    const register2 = await employerRepository.findOneBy({ id: 2 });
    const register3 = await employerRepository.findOneBy({ id: 3 });

    if (!register1) {
      const new1 = employerRepository.create(data1);
      await employerRepository.save(new1);
    }

    if (!register2) {
      const new2 = employerRepository.create(data2);
      await employerRepository.save(new2);
    }

    if (!register3) {
      const new3 = employerRepository.create(data3);
      await employerRepository.save(new3);
    }
  }
}
