import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { Experience } from '../../users/entities/experience.entity';

export class ExperienceSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const experienceRepository = dataSource.getRepository(Experience);

    const data1 = {
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pretium eu nisl vel ultricies. Sed facilisis non justo nec fringilla. Vivamus sed tincidunt tortor. Vivamus non laoreet lacus. Vestibulum imperdiet porta elementum. Donec nisl sapien, lacinia eget auctor eu, ultricies ac nisi. Maecenas at congue turpis, id lobortis nibh. Nulla vel leo sapien. Cras tincidunt erat eget felis vehicula, non laoreet erat efficitur. Cras ultricies mauris at elit pharetra, nec tempor est sollicitudin',
      worker: {
        id: 1,
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
      },
    };

    const data2 = {
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pretium eu nisl vel ultricies. Sed facilisis non justo nec fringilla. Vivamus sed tincidunt tortor. Vivamus non laoreet lacus. Vestibulum imperdiet porta elementum. Donec nisl sapien, lacinia eget auctor eu, ultricies ac nisi. Maecenas at congue turpis, id lobortis nibh. Nulla vel leo sapien. Cras tincidunt erat eget felis vehicula, non laoreet erat efficitur. Cras ultricies mauris at elit pharetra, nec tempor est sollicitudin',
      worker: {
        id: 2,
        address: '362 Oxford Alley',
        city: 'Oakland',
        state: 'California',
        age: 37,
        gender: 2,
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
      },
    };

    const data3 = {
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pretium eu nisl vel ultricies. Sed facilisis non justo nec fringilla. Vivamus sed tincidunt tortor. Vivamus non laoreet lacus. Vestibulum imperdiet porta elementum. Donec nisl sapien, lacinia eget auctor eu, ultricies ac nisi. Maecenas at congue turpis, id lobortis nibh. Nulla vel leo sapien. Cras tincidunt erat eget felis vehicula, non laoreet erat efficitur. Cras ultricies mauris at elit pharetra, nec tempor est sollicitudin',
      worker: {
        id: 1,
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
      },
    };

    const register1 = await experienceRepository.findOneBy({ id: 1 });
    const register2 = await experienceRepository.findOneBy({ id: 2 });
    const register3 = await experienceRepository.findOneBy({ id: 3 });

    if (!register1) {
      const new1 = experienceRepository.create(data1);
      await experienceRepository.save(new1);
    }

    if (!register2) {
      const new2 = experienceRepository.create(data2);
      await experienceRepository.save(new2);
    }

    if (!register3) {
      const new3 = experienceRepository.create(data3);
      await experienceRepository.save(new3);
    }
  }
}
