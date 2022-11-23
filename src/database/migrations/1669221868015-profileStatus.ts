import { MigrationInterface, QueryRunner } from 'typeorm';

export class profileStatus1669221868015 implements MigrationInterface {
  name = 'profileStatus1669221868015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employers_data" ADD "lastFour" character varying(255)`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_profilestatus_enum" AS ENUM('0', '1', '2', '3')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "profileStatus" "public"."users_profilestatus_enum" NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profileStatus"`);
    await queryRunner.query(`DROP TYPE "public"."users_profilestatus_enum"`);
    await queryRunner.query(
      `ALTER TABLE "employers_data" DROP COLUMN "lastFour"`,
    );
  }
}
