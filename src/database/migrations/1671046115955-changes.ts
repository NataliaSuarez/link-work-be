import { MigrationInterface, QueryRunner } from 'typeorm';

export class changes1671046115955 implements MigrationInterface {
  name = 'changes1671046115955';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "appleIdIdentifier" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "appleIdIdentifier"`,
    );
  }
}
