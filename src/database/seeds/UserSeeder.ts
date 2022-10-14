import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { User } from '../../users/entities/user.entity';

export class UserSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    const userData1 = {
      firstName: 'Selie',
      lastName: 'Corbould',
      email: 'scorbould0@who.int',
      password: 'string',
      verified: true,
      profileImg: 'http://dummyimage.com/220x100.png/ff4444/ffffff',
      role: 2,
    };

    const userData2 = {
      firstName: 'Guntar',
      lastName: 'Donnett',
      email: 'gdonnett1@oaic.gov.au',
      password: '0iOQpild',
      verified: true,
      profileImg: 'http://dummyimage.com/102x100.png/cc0000/ffffff',
      role: 2,
    };

    const userData3 = {
      firstName: 'Atalanta',
      lastName: 'Pitts',
      email: 'apitts2@uiuc.edu',
      password: 'Ng5AUZ',
      verified: true,
      profileImg: 'http://dummyimage.com/147x100.png/5fa2dd/ffffff',
      role: 1,
    };

    const userData4 = {
      firstName: 'Chester',
      lastName: 'Sussems',
      email: 'csussems3@nifty.com',
      password: '1TBZtiRo',
      verified: false,
      profileImg: 'http://dummyimage.com/176x100.png/dddddd/000000',
      role: 1,
    };

    const userData5 = {
      firstName: 'Timofei',
      lastName: 'Dawks',
      email: 'tdawks4@rediff.com',
      password: '1xNfXFmtPzZG',
      verified: true,
      profileImg: 'http://dummyimage.com/113x100.png/ff4444/ffffff',
      role: 1,
    };

    const userData6 = {
      firstName: 'Thomas',
      lastName: 'Jenkins',
      email: 'tj44@rediff.com',
      password: '1XfFsmtfPzsZG',
      verified: false,
      profileImg: 'http://dummyimage.com/123x120.png/ff4444/ffffff',
      role: 2,
    };

    const userData7 = {
      firstName: 'Christian',
      lastName: 'Davids',
      email: 'tj4ds4@rediff.com',
      password: '1XfFsmtfdPzsZG',
      verified: true,
      profileImg: 'http://dummyimage.com/123x120.png/ff4444/ffffff',
      role: 2,
    };

    const userData8 = {
      firstName: 'Thomas',
      lastName: 'Jones',
      email: 'tdasj44@rediff.com',
      password: '1XfFsmtfPzsZG',
      verified: true,
      profileImg: 'http://dummyimage.com/123x120.png/ff4444/ffffff',
      role: 2,
    };

    const user1 = await userRepository.findOneBy({ id: 1 });
    const user2 = await userRepository.findOneBy({ id: 2 });
    const user3 = await userRepository.findOneBy({ id: 3 });
    const user4 = await userRepository.findOneBy({ id: 4 });
    const user5 = await userRepository.findOneBy({ id: 5 });
    const user6 = await userRepository.findOneBy({ id: 6 });
    const user7 = await userRepository.findOneBy({ id: 7 });
    const user8 = await userRepository.findOneBy({ id: 8 });

    if (!user1) {
      const newUser1 = userRepository.create(userData1);
      await userRepository.save(newUser1);
    }

    if (!user2) {
      const newUser2 = userRepository.create(userData2);
      await userRepository.save(newUser2);
    }

    if (!user3) {
      const newUser3 = userRepository.create(userData3);
      await userRepository.save(newUser3);
    }

    if (!user4) {
      const newUser4 = userRepository.create(userData4);
      await userRepository.save(newUser4);
    }

    if (!user5) {
      const newUser5 = userRepository.create(userData5);
      await userRepository.save(newUser5);
    }

    if (!user6) {
      const newUser6 = userRepository.create(userData6);
      await userRepository.save(newUser6);
    }

    if (!user7) {
      const newUser7 = userRepository.create(userData7);
      await userRepository.save(newUser7);
    }

    if (!user8) {
      const newUser8 = userRepository.create(userData8);
      await userRepository.save(newUser8);
    }
  }
}
