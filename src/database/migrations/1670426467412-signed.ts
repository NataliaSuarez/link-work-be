import { MigrationInterface, QueryRunner } from 'typeorm';

export class signed1670426467412 implements MigrationInterface {
  name = 'signed1670426467412';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workers_data" RENAME COLUMN "sign" TO "signed"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workers_data" RENAME COLUMN "signed" TO "sign"`,
    );
  }
}
