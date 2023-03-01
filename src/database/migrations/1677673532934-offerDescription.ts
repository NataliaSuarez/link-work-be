import { MigrationInterface, QueryRunner } from 'typeorm';

export class offerDescription1677673532934 implements MigrationInterface {
  name = 'offerDescription1677673532934';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "offers" ADD "description" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "description"`);
  }
}
