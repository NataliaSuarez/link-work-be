import { MigrationInterface, QueryRunner } from 'typeorm';

export class lastLogin1673883137964 implements MigrationInterface {
  name = 'lastLogin1673883137964';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "fcmIdentityToken" TO "lastLogin"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastLogin"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "lastLogin" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastLogin"`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "lastLogin" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "lastLogin" TO "fcmIdentityToken"`,
    );
  }
}
