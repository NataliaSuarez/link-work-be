import { MigrationInterface, QueryRunner } from 'typeorm';

export class changes1669745006407 implements MigrationInterface {
  name = 'changes1669745006407';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "lat" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD "long" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "blocked" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_blockedreason_enum" AS ENUM('0', '1')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "blockedReason" "public"."users_blockedreason_enum" NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "failedAttemptsToLogin" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "retrieveToken" character varying(255)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "retrieveToken"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "failedAttemptsToLogin"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "blockedReason"`);
    await queryRunner.query(`DROP TYPE "public"."users_blockedreason_enum"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "blocked"`);
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "long"`);
    await queryRunner.query(`ALTER TABLE "addresses" DROP COLUMN "lat"`);
  }
}
