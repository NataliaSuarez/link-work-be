import { MigrationInterface, QueryRunner } from 'typeorm';

export class WorkerAndImgs1670355680871 implements MigrationInterface {
  name = 'WorkerAndImgs1670355680871';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_images" DROP COLUMN "avatar"`);
    await queryRunner.query(
      `ALTER TABLE "workers_data" ADD "uscis" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers_data" ADD "sign" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_images_type_enum" AS ENUM('profileImg', 'idFrontImg', 'idBackImg', 'signatureImg', 'businessImg')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_images" ADD "type" "public"."user_images_type_enum" NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "workers_data" DROP COLUMN "ssn"`);
    await queryRunner.query(
      `ALTER TABLE "workers_data" ADD "ssn" character varying(255)`,
    );
    await queryRunner.query(`ALTER TABLE "user_images" DROP COLUMN "imgUrl"`);
    await queryRunner.query(
      `ALTER TABLE "user_images" ADD "imgUrl" text NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_images" DROP COLUMN "imgUrl"`);
    await queryRunner.query(
      `ALTER TABLE "user_images" ADD "imgUrl" character varying(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "workers_data" DROP COLUMN "ssn"`);
    await queryRunner.query(
      `ALTER TABLE "workers_data" ADD "ssn" integer NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "user_images" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."user_images_type_enum"`);
    await queryRunner.query(`ALTER TABLE "workers_data" DROP COLUMN "sign"`);
    await queryRunner.query(`ALTER TABLE "workers_data" DROP COLUMN "uscis"`);
    await queryRunner.query(
      `ALTER TABLE "user_images" ADD "avatar" boolean NOT NULL`,
    );
  }
}
