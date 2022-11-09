// import { DataSource } from 'typeorm';
// import { Seeder, SeederFactoryManager } from 'typeorm-extension';

// import { Shift } from '../../offers_and_shifts/entities/shift.entity';

// export class ShiftSeeder implements Seeder {
//   async run(
//     dataSource: DataSource,
//     factoryManager: SeederFactoryManager,
//   ): Promise<void> {
//     const shiftRepository = dataSource.getRepository(Shift);

//     const data1 = {
//       clockIn: false,
//       clockOut: false,
//       status: 0,
//       worker: {
//         id: 1,
//       },
//       offer: {
//         id: 4,
//       },
//     };
//     const data2 = {
//       clockIn: false,
//       clockOut: false,
//       status: 0,
//       worker: {
//         id: 1,
//       },
//       offer: { id: 5 },
//     };

//     const register1 = await shiftRepository.findOneBy({ id: 1 });
//     const register2 = await shiftRepository.findOneBy({ id: 2 });

//     if (!register1) {
//       const new1 = shiftRepository.create(data1);
//       await shiftRepository.save(new1);
//     }

//     if (!register2) {
//       const new2 = shiftRepository.create(data2);
//       await shiftRepository.save(new2);
//     }
//   }
// }
