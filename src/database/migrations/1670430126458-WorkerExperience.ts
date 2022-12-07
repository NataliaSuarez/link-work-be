import { MigrationInterface, QueryRunner } from 'typeorm';

export class WorkerExperience1670430126458 implements MigrationInterface {
  name = 'WorkerExperience1670430126458';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workers_data" ADD "workerExperience" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workers_data" DROP COLUMN "workerExperience"`,
    );
  }
}
