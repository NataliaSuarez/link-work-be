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
      businessName: 'Jacobi Group',
      businessCode: 9,
      description: 'Lorem ipsum lorem ipsum lorem ipsum',
      user: {
        id: 3,
        firstName: 'Atalanta',
        lastName: 'Pitts',
        address: '362 Oxford Alley',
        city: 'Oakland',
        state: 'California',
        email: 'apitts2@uiuc.edu',
        password: 'Ng5AUZ',
        profileImg: 'http://dummyimage.com/147x100.png/5fa2dd/ffffff',
        role: 1,
      },
    };
    const data2 = {
      businessName: 'Wilkinson Group',
      businessCode: 7,
      description: 'Lorem ipsum lorem ipsum lorem ipsum',
      user: {
        id: 4,
        firstName: 'Chester',
        lastName: 'Sussems',
        address: '1 Algoma Park',
        city: 'Raleigh',
        state: 'North Carolina',
        email: 'csussems3@nifty.com',
        password: '1TBZtiRo',
        profileImg: 'http://dummyimage.com/176x100.png/dddddd/000000',
        role: 1,
      },
    };
    const data3 = {
      businessName: 'Carroll Inc',
      businessCode: 1,
      description: 'Lorem ipsum lorem ipsum lorem ipsum',
      user: {
        id: 5,
        firstName: 'Timofei',
        lastName: 'Dawks',
        address: '69 Dennis Drive',
        city: 'Newark',
        state: 'New Jersey',
        email: 'tdawks4@rediff.com',
        password: '1xNfXFmtPzZG',
        profileImg: 'http://dummyimage.com/113x100.png/ff4444/ffffff',
        role: 1,
      },
    };

    const new1 = employerRepository.create(data1);
    await employerRepository.save(new1);

    const new2 = employerRepository.create(data2);
    await employerRepository.save(new2);

    const new3 = employerRepository.create(data3);
    await employerRepository.save(new3);
  }
}
