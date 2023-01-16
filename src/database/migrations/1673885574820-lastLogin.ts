import { MigrationInterface, QueryRunner } from 'typeorm';

export class lastLogin1673885574820 implements MigrationInterface {
  name = 'lastLogin1673885574820';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "lastLogin" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastLogin"`);
  }
}
