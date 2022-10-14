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
      workerId: 1,
    };

    const data2 = {
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pretium eu nisl vel ultricies. Sed facilisis non justo nec fringilla. Vivamus sed tincidunt tortor. Vivamus non laoreet lacus. Vestibulum imperdiet porta elementum. Donec nisl sapien, lacinia eget auctor eu, ultricies ac nisi. Maecenas at congue turpis, id lobortis nibh. Nulla vel leo sapien. Cras tincidunt erat eget felis vehicula, non laoreet erat efficitur. Cras ultricies mauris at elit pharetra, nec tempor est sollicitudin',
      workerId: 2,
    };

    const data3 = {
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pretium eu nisl vel ultricies. Sed facilisis non justo nec fringilla. Vivamus sed tincidunt tortor. Vivamus non laoreet lacus. Vestibulum imperdiet porta elementum. Donec nisl sapien, lacinia eget auctor eu, ultricies ac nisi. Maecenas at congue turpis, id lobortis nibh. Nulla vel leo sapien. Cras tincidunt erat eget felis vehicula, non laoreet erat efficitur. Cras ultricies mauris at elit pharetra, nec tempor est sollicitudin',
      workerId: 2,
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
