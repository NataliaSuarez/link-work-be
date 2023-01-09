import { MigrationInterface, QueryRunner } from 'typeorm';

export class offerDescription1673273866472 implements MigrationInterface {
  name = 'offerDescription1673273866472';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "description"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "offers" ADD "description" text`);
  }
}
