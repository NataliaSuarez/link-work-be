import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Users } from '../../users/entities/users.entity';

export class UserSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const userRepository = dataSource.getRepository(Users);

    const userData1 = {
      firstName: 'Selie',
      lastName: 'Corbould',
      address: '41879 Mosinee Place',
      city: 'Fresno',
      state: 'California',
      email: 'scorbould0@who.int',
      password: 'dK9M0lPxu',
      profileImg: 'http://dummyimage.com/220x100.png/ff4444/ffffff',
      role: 2,
    };

    const userData2 = {
      firstName: 'Guntar',
      lastName: 'Donnett',
      address: '90 Sage Junction',
      city: 'New York City',
      state: 'New York',
      email: 'gdonnett1@oaic.gov.au',
      password: '0iOQpild',
      profileImg: 'http://dummyimage.com/102x100.png/cc0000/ffffff',
      role: 2,
    };

    const userData3 = {
      firstName: 'Atalanta',
      lastName: 'Pitts',
      address: '362 Oxford Alley',
      city: 'Oakland',
      state: 'California',
      email: 'apitts2@uiuc.edu',
      password: 'Ng5AUZ',
      profileImg: 'http://dummyimage.com/147x100.png/5fa2dd/ffffff',
      role: 1,
    };
    const userData4 = {
      firstName: 'Chester',
      lastName: 'Sussems',
      address: '1 Algoma Park',
      city: 'Raleigh',
      state: 'North Carolina',
      email: 'csussems3@nifty.com',
      password: '1TBZtiRo',
      profileImg: 'http://dummyimage.com/176x100.png/dddddd/000000',
      role: 1,
    };
    const userData5 = {
      firstName: 'Timofei',
      lastName: 'Dawks',
      address: '69 Dennis Drive',
      city: 'Newark',
      state: 'New Jersey',
      email: 'tdawks4@rediff.com',
      password: '1xNfXFmtPzZG',
      profileImg: 'http://dummyimage.com/113x100.png/ff4444/ffffff',
      role: 1,
    };

    const userData6 = {
      firstName: 'Thomas',
      lastName: 'Jenkins',
      address: '321 Privet Drive',
      city: 'Miami',
      state: 'Florida',
      email: 'tj44@rediff.com',
      password: '1XfFsmtfPzsZG',
      profileImg: 'http://dummyimage.com/123x120.png/ff4444/ffffff',
      role: 2,
    };

    const newUser1 = userRepository.create(userData1);
    await userRepository.save(newUser1);

    const newUser2 = userRepository.create(userData2);
    await userRepository.save(newUser2);

    const newUser3 = userRepository.create(userData3);
    await userRepository.save(newUser3);

    const newUser4 = userRepository.create(userData4);
    await userRepository.save(newUser4);

    const newUser5 = userRepository.create(userData5);
    await userRepository.save(newUser5);

    const newUser6 = userRepository.create(userData6);
    await userRepository.save(newUser6);
  }
}
