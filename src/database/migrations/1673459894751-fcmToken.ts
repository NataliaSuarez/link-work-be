import { MigrationInterface, QueryRunner } from 'typeorm';

export class fcmToken1673459894751 implements MigrationInterface {
  name = 'fcmToken1673459894751';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "fcmIdentityToken" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "fcmIdentityToken"`,
    );
  }
}
