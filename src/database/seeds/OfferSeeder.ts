// import { DataSource } from 'typeorm';
// import { Seeder, SeederFactoryManager } from 'typeorm-extension';

// import { Offer } from '../../offers_and_shifts/entities/offer.entity';

// export class OfferSeeder implements Seeder {
//   async run(
//     dataSource: DataSource,
//     factoryManager: SeederFactoryManager,
//   ): Promise<void> {
//     const offerRepository = dataSource.getRepository(Offer);

//     const fecha1 = new Date('2023-02-12 10:00:00');
//     const fecha2 = new Date('2023-02-12 22:00:00');

//     const data1 = {
//       title: 'Janitor',
//       usdHour: 2,
//       usdTotal: 24,
//       category: 1,
//       description:
//         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pretium eu nisl vel ultricies. Sed facilisis non justo nec fringilla. Vivamus sed tincidunt tortor. Vivamus non laoreet lacus. Vestibulum imperdiet porta elementum. Donec nisl sapien, lacinia eget auctor eu, ultricies ac nisi. Maecenas at congue turpis, id lobortis nibh. Nulla vel leo sapien. Cras tincidunt erat eget felis vehicula, non laoreet erat efficitur. Cras ultricies mauris at elit pharetra, nec tempor est sollicitudin',
//       status: 0,
//       applicants: [
//         {
//           id: 1,
//           address: '90 Sage Junction',
//           city: 'New York City',
//           state: 'New York',
//           age: 60,
//           gender: 1,
//           description: 'Lorem ipsum lorem ipsum lorem ipsum',
//           ssn: 4546415,
//           stars: 4,
//           totalReviews: 15,
//           stripeId: '',
//         },
//         {
//           id: 3,
//           address: '1 Algoma Park',
//           city: 'Raleigh',
//           state: 'North Carolina',
//           age: 21,
//           gender: 2,
//           description: 'Lorem ipsum lorem ipsum lorem ipsum',
//           ssn: 43535345,
//           stars: 2,
//           totalReviews: 11,
//           stripeId: '',
//         },
//       ],
//       employer: {
//         id: 1,
//         address: '546 Douglas Street',
//         city: 'Miami',
//         state: 'Florida',
//         businessName: 'Jacobi Group',
//         businessCode: 0,
//         description: 'Lorem ipsum lorem ipsum lorem ipsum',
//         stars: 4,
//         totalReviews: 15,
//         customerId: '',
//       },
//       from: fecha1,
//       to: fecha2,
//     };
//     const data2 = {
//       title: 'Waiter',
//       usdHour: 4,
//       usdTotal: 80,
//       category: 3,
//       description:
//         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pretium eu nisl vel ultricies. Sed facilisis non justo nec fringilla. Vivamus sed tincidunt tortor. Vivamus non laoreet lacus. Vestibulum imperdiet porta elementum. Donec nisl sapien, lacinia eget auctor eu, ultricies ac nisi. Maecenas at congue turpis, id lobortis nibh. Nulla vel leo sapien. Cras tincidunt erat eget felis vehicula, non laoreet erat efficitur. Cras ultricies mauris at elit pharetra, nec tempor est sollicitudin',
//       status: 0,
//       applicants: [],
//       employer: {
//         id: 2,
//         address: '44 Douglas Street',
//         city: 'Miami',
//         state: 'Florida',
//         businessName: 'Wilkinson Group',
//         businessCode: 0,
//         description: 'Lorem ipsum lorem ipsum lorem ipsum',
//         stars: 3,
//         totalReviews: 50,
//         customerId: '',
//       },
//       from: fecha1,
//       to: fecha2,
//     };
//     const data3 = {
//       title: 'Receptionist',
//       usdHour: 4,
//       usdTotal: 40,
//       category: 4,
//       description:
//         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pretium eu nisl vel ultricies. Sed facilisis non justo nec fringilla. Vivamus sed tincidunt tortor. Vivamus non laoreet lacus. Vestibulum imperdiet porta elementum. Donec nisl sapien, lacinia eget auctor eu, ultricies ac nisi. Maecenas at congue turpis, id lobortis nibh. Nulla vel leo sapien. Cras tincidunt erat eget felis vehicula, non laoreet erat efficitur. Cras ultricies mauris at elit pharetra, nec tempor est sollicitudin',
//       status: 0,
//       applicants: [
//         {
//           id: 1,
//           address: '90 Sage Junction',
//           city: 'New York City',
//           state: 'New York',
//           age: 60,
//           gender: 1,
//           description: 'Lorem ipsum lorem ipsum lorem ipsum',
//           ssn: 4546415,
//           stars: 4,
//           totalReviews: 15,
//           stripeId: '',
//         },
//       ],
//       employer: {
//         id: 2,
//         address: '44 Douglas Street',
//         city: 'Miami',
//         state: 'Florida',
//         businessName: 'Wilkinson Group',
//         businessCode: 0,
//         description: 'Lorem ipsum lorem ipsum lorem ipsum',
//         stars: 3,
//         totalReviews: 50,
//         customerId: '',
//       },
//       from: fecha1,
//       to: fecha2,
//     };
//     const data4 = {
//       title: 'Warehouse Operator',
//       usdHour: 7,
//       usdTotal: 63,
//       category: 1,
//       description:
//         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pretium eu nisl vel ultricies. Sed facilisis non justo nec fringilla. Vivamus sed tincidunt tortor. Vivamus non laoreet lacus. Vestibulum imperdiet porta elementum. Donec nisl sapien, lacinia eget auctor eu, ultricies ac nisi. Maecenas at congue turpis, id lobortis nibh. Nulla vel leo sapien. Cras tincidunt erat eget felis vehicula, non laoreet erat efficitur. Cras ultricies mauris at elit pharetra, nec tempor est sollicitudin',
//       status: 1,
//       applicants: [
//         {
//           id: 2,
//           address: '362 Oxford Alley',
//           city: 'Oakland',
//           state: 'California',
//           age: 37,
//           gender: 2,
//           description: 'Lorem ipsum lorem ipsum lorem ipsum',
//           ssn: 534534534,
//           stars: 5,
//           totalReviews: 8,
//           stripeId: '',
//         },
//         {
//           id: 3,
//           address: '1 Algoma Park',
//           city: 'Raleigh',
//           state: 'North Carolina',
//           age: 21,
//           gender: 2,
//           description: 'Lorem ipsum lorem ipsum lorem ipsum',
//           ssn: 43535345,
//           stars: 2,
//           totalReviews: 11,
//           stripeId: '',
//         },
//       ],
//       employer: {
//         id: 2,
//         address: '44 Douglas Street',
//         city: 'Miami',
//         state: 'Florida',
//         businessName: 'Wilkinson Group',
//         businessCode: 0,
//         description: 'Lorem ipsum lorem ipsum lorem ipsum',
//         stars: 3,
//         totalReviews: 50,
//         customerId: '',
//       },
//       from: fecha1,
//       to: fecha2,
//     };
//     const data5 = {
//       title: 'Help Desk Operator',
//       usdHour: 2,
//       usdTotal: 24,
//       category: 4,
//       description:
//         'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pretium eu nisl vel ultricies. Sed facilisis non justo nec fringilla. Vivamus sed tincidunt tortor. Vivamus non laoreet lacus. Vestibulum imperdiet porta elementum. Donec nisl sapien, lacinia eget auctor eu, ultricies ac nisi. Maecenas at congue turpis, id lobortis nibh. Nulla vel leo sapien. Cras tincidunt erat eget felis vehicula, non laoreet erat efficitur. Cras ultricies mauris at elit pharetra, nec tempor est sollicitudin',
//       status: 1,
//       applicants: [
//         {
//           id: 1,
//           address: '90 Sage Junction',
//           city: 'New York City',
//           state: 'New York',
//           age: 60,
//           gender: 1,
//           description: 'Lorem ipsum lorem ipsum lorem ipsum',
//           ssn: 4546415,
//           stars: 4,
//           totalReviews: 15,
//           stripeId: '',
//         },
//         {
//           id: 3,
//           address: '1 Algoma Park',
//           city: 'Raleigh',
//           state: 'North Carolina',
//           age: 21,
//           gender: 2,
//           description: 'Lorem ipsum lorem ipsum lorem ipsum',
//           ssn: 43535345,
//           stars: 2,
//           totalReviews: 11,
//           stripeId: '',
//         },
//       ],
//       employerUser: {
//         id: 1,
//       },
//       from: fecha1,
//       to: fecha2,
//     };

//     const register1 = await offerRepository.findOneBy({ id: 1 });
//     const register2 = await offerRepository.findOneBy({ id: 2 });
//     const register3 = await offerRepository.findOneBy({ id: 3 });
//     const register4 = await offerRepository.findOneBy({ id: 4 });
//     const register5 = await offerRepository.findOneBy({ id: 5 });

//     if (!register1) {
//       const new1 = offerRepository.create(data1);
//       await offerRepository.save(new1);
//     }

//     if (!register2) {
//       const new2 = offerRepository.create(data2);
//       await offerRepository.save(new2);
//     }

//     if (!register3) {
//       const new3 = offerRepository.create(data3);
//       await offerRepository.save(new3);
//     }

//     if (!register4) {
//       const new4 = offerRepository.create(data4);
//       await offerRepository.save(new4);
//     }

//     if (!register5) {
//       const new5 = offerRepository.create(data5);
//       await offerRepository.save(new5);
//     }
//   }
// }
