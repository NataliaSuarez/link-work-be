import { MigrationInterface, QueryRunner } from 'typeorm';

export class changes1666730133534 implements MigrationInterface {
  name = 'changes1666730133534';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "street"`);
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "number"`);
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "address" character varying(255) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "address"`);
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "number" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "street" character varying(255) NOT NULL`,
    );
  }
}
