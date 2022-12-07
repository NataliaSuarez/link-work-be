import { MigrationInterface, QueryRunner } from 'typeorm';

export class bankLastFour1670438846581 implements MigrationInterface {
  name = 'bankLastFour1670438846581';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workers_data" ADD "accountLastFour" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers_data" ADD "routingLastFour" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workers_data" DROP COLUMN "routingLastFour"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers_data" DROP COLUMN "accountLastFour"`,
    );
  }
}
