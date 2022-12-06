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
      employerData: {
        address: '90 Sage Junction',
        city: 'New York City',
        state: 'New York',
        postalCode: '35802',
        dayOfBirth: 15,
        monthOfBirth: 1,
        yearOfBirth: 1974,
        phone: '+14082684525',
        personalUrl: 'www.asdas.com',
        gender: 1,
        description: 'Lorem ipsum lorem ipsum lorem ipsum',
        ssn: 4546415,
        stars: 4,
        totalReviews: 15,
        stripeId: '',
      },
    };

    const userData2 = {
      firstName: 'Guntar',
      lastName: 'Donnett',
      email: 'gdonnett1@oaic.gov.au',
      password: '0iOQpild',
      verified: true,
      profileImg: 'http://dummyimage.com/102x100.png/cc0000/ffffff',
      role: 2,
      workerData: {
        address: '362 Oxford Alley',
        city: 'Oakland',
        state: 'California',
        postalCode: '35802',
        dayOfBirth: 15,
        monthOfBirth: 1,
        yearOfBirth: 1974,
        phone: '+14082684525',
        personalUrl: 'www.asdas.com',
        gender: 2,
        description: 'Lorem ipsum lorem ipsum lorem ipsum',
        ssn: 534534534,
        stars: 5,
        totalReviews: 8,
        stripeId: '',
      },
    };

    const userData3 = {
      firstName: 'Atalanta',
      lastName: 'Pitts',
      email: 'apitts2@uiuc.edu',
      password: 'Ng5AUZ',
      verified: true,
      profileImg: 'http://dummyimage.com/147x100.png/5fa2dd/ffffff',
      role: 1,
      employerData: {
        address: '546 Douglas Street',
        city: 'Miami',
        state: 'Florida',
        businessName: 'Jacobi Group',
        businessCode: 0,
        description: 'Lorem ipsum lorem ipsum lorem ipsum',
        stars: 4,
        totalReviews: 15,
        customerId: '',
      },
    };

    const userData4 = {
      firstName: 'Chester',
      lastName: 'Sussems',
      email: 'csussems3@nifty.com',
      password: '1TBZtiRo',
      verified: false,
      profileImg: 'http://dummyimage.com/176x100.png/dddddd/000000',
      role: 1,
      employerData: {
        address: '44 Douglas Street',
        city: 'Miami',
        state: 'Florida',
        businessName: 'Wilkinson Group',
        businessCode: 1,
        description: 'Lorem ipsum lorem ipsum lorem ipsum',
        stars: 3,
        totalReviews: 50,
        customerId: '',
      },
    };

    const userData5 = {
      firstName: 'Timofei',
      lastName: 'Dawks',
      email: 'tdawks4@rediff.com',
      password: '1xNfXFmtPzZG',
      verified: true,
      profileImg: 'http://dummyimage.com/113x100.png/ff4444/ffffff',
      role: 1,
      employerData: {
        address: '321 Privet Drive',
        city: 'Miami',
        state: 'Florida',
        businessName: 'Carroll Inc',
        businessCode: 2,
        description: 'Lorem ipsum lorem ipsum lorem ipsum',
        stars: 5,
        totalReviews: 2,
        customerId: '',
      },
    };

    const userData6 = {
      firstName: 'Thomas',
      lastName: 'Jenkins',
      email: 'tj44@rediff.com',
      password: '1XfFsmtfPzsZG',
      verified: false,
      profileImg: 'http://dummyimage.com/123x120.png/ff4444/ffffff',
      role: 2,
      workerData: {
        address: '1 Algoma Park',
        city: 'Raleigh',
        state: 'North Carolina',
        postalCode: '35802',
        dayOfBirth: 15,
        monthOfBirth: 1,
        yearOfBirth: 1974,
        phone: '+14082684525',
        personalUrl: 'www.asdas.com',
        gender: 2,
        description: 'Lorem ipsum lorem ipsum lorem ipsum',
        ssn: 43535345,
        stars: 2,
        totalReviews: 11,
        stripeId: '',
      },
    };

    const userData7 = {
      firstName: 'Christian',
      lastName: 'Davids',
      email: 'tj4ds4@rediff.com',
      password: '1XfFsmtfdPzsZG',
      verified: true,
      profileImg: 'http://dummyimage.com/123x120.png/ff4444/ffffff',
      role: 2,
      workerData: {
        address: '69 Dennis Drive',
        city: 'Newark',
        state: 'New Jersey',
        postalCode: '35802',
        dayOfBirth: 15,
        monthOfBirth: 1,
        yearOfBirth: 1974,
        phone: '+14082684525',
        personalUrl: 'www.asdas.com',
        gender: 2,
        description: 'Lorem ipsum lorem ipsum lorem ipsum',
        ssn: 2752777,
        stars: 5,
        totalReviews: 7,
        stripeId: '',
      },
    };

    const userData8 = {
      firstName: 'Thomas',
      lastName: 'Jones',
      email: 'tdasj44@rediff.com',
      password: '1XfFsmtfPzsZG',
      verified: true,
      profileImg: 'http://dummyimage.com/123x120.png/ff4444/ffffff',
      role: 2,
      workerData: {
        address: '41879 Mosinee Place',
        city: 'Fresno',
        state: 'California',
        postalCode: '35802',
        dayOfBirth: 15,
        monthOfBirth: 1,
        yearOfBirth: 1974,
        phone: '+14082684525',
        personalUrl: 'www.asdas.com',
        gender: 2,
        description: 'Lorem ipsum lorem ipsum lorem ipsum',
        ssn: 87734538,
        stars: 4,
        totalReviews: 4,
        stripeId: '',
      },
    };

    // const newUser1 = userRepository.create(userData1);
    // await userRepository.save(newUser1);

    // const newUser2 = userRepository.create(userData2);
    // await userRepository.save(newUser2);

    // const newUser3 = userRepository.create(userData3);
    // await userRepository.save(newUser3);

    // const newUser4 = userRepository.create(userData4);
    // await userRepository.save(newUser4);

    // const newUser5 = userRepository.create(userData5);
    // await userRepository.save(newUser5);

    // const newUser6 = userRepository.create(userData6);
    // await userRepository.save(newUser6);

    // const newUser7 = userRepository.create(userData7);
    // await userRepository.save(newUser7);

    // const newUser8 = userRepository.create(userData8);
    // await userRepository.save(newUser8);
  }
}
