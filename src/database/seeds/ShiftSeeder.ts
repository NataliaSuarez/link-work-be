import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { Shift } from '../../offers/entities/shift.entity';

export class ShiftSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const shiftRepository = dataSource.getRepository(Shift);

    const fecha1 = new Date('2023-02-12 10:00:00');
    const fecha2 = new Date('2023-02-12 22:00:00');

    const data1 = {
      clockIn: false,
      clockOut: false,
      status: 0,
      worker: {
        id: 4,
        age: 32,
        stars: 5,
        totalReviews: 7,
        user: {
          id: 7,
          firstName: 'Christian',
          lastName: 'Davids',
          address: '321 Privet Park',
          city: 'Miami',
          state: 'Florida',
          email: 'tj4ds4@rediff.com',
          password: '1XfFsmtfdPzsZG',
          profileImg: 'http://dummyimage.com/123x120.png/ff4444/ffffff',
          role: 2,
        },
      },
      offer: {
        id: 4,
        title: 'Warehouse Operator',
        usdHour: 7,
        usdTotal: 63,
        category: 1,
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pretium eu nisl vel ultricies. Sed facilisis non justo nec fringilla. Vivamus sed tincidunt tortor. Vivamus non laoreet lacus. Vestibulum imperdiet porta elementum. Donec nisl sapien, lacinia eget auctor eu, ultricies ac nisi. Maecenas at congue turpis, id lobortis nibh. Nulla vel leo sapien. Cras tincidunt erat eget felis vehicula, non laoreet erat efficitur. Cras ultricies mauris at elit pharetra, nec tempor est sollicitudin',
        status: 1,
        applicants: [
          {
            id: 2,
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
          },
          {
            id: 3,
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
          },
        ],
        employer: {
          id: 2,
          businessName: 'Wilkinson Group',
          businessCode: 7,
          description: 'Lorem ipsum lorem ipsum lorem ipsum',
        },
        from: fecha1,
        to: fecha2,
      },
    };
    const data2 = {
      clockIn: false,
      clockOut: false,
      status: 0,
      worker: {
        id: 5,
        age: 22,
        stars: 4,
        totalReviews: 4,
        user: {
          id: 8,
          firstName: 'Thomas',
          lastName: 'Jones',
          address: '44 Douglas Street',
          city: 'Miami',
          state: 'Florida',
          email: 'tdasj44@rediff.com',
          password: '1XfFsmtfPzsZG',
          profileImg: 'http://dummyimage.com/123x120.png/ff4444/ffffff',
          role: 2,
        },
      },
      offer: {
        id: 5,
        title: 'Help Desk Operator',
        usdHour: 2,
        usdTotal: 24,
        category: 4,
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pretium eu nisl vel ultricies. Sed facilisis non justo nec fringilla. Vivamus sed tincidunt tortor. Vivamus non laoreet lacus. Vestibulum imperdiet porta elementum. Donec nisl sapien, lacinia eget auctor eu, ultricies ac nisi. Maecenas at congue turpis, id lobortis nibh. Nulla vel leo sapien. Cras tincidunt erat eget felis vehicula, non laoreet erat efficitur. Cras ultricies mauris at elit pharetra, nec tempor est sollicitudin',
        status: 1,
        applicants: [
          {
            id: 1,
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
          },
          {
            id: 3,
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
          },
        ],
        employer: {
          id: 1,
          businessName: 'Jacobi Group',
          businessCode: 9,
          description: 'Lorem ipsum lorem ipsum lorem ipsum',
        },
        from: fecha1,
        to: fecha2,
      },
    };

    const new1 = shiftRepository.create(data1);
    await shiftRepository.save(new1);

    const new2 = shiftRepository.create(data2);
    await shiftRepository.save(new2);
  }
}
