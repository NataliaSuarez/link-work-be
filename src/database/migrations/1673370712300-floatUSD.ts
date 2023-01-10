import { MigrationInterface, QueryRunner } from 'typeorm';

export class floatUSD1673370712300 implements MigrationInterface {
  name = 'floatUSD1673370712300';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "usdHour"`);
    await queryRunner.query(
      `ALTER TABLE "offers" ADD "usdHour" double precision NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "usdTotal"`);
    await queryRunner.query(
      `ALTER TABLE "offers" ADD "usdTotal" double precision NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "usdTotal"`);
    await queryRunner.query(
      `ALTER TABLE "offers" ADD "usdTotal" integer NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "usdHour"`);
    await queryRunner.query(
      `ALTER TABLE "offers" ADD "usdHour" integer NOT NULL`,
    );
  }
}
