import { MigrationInterface, QueryRunner } from 'typeorm';

export class createUsersTable1662659212087 implements MigrationInterface {
  name = 'createUsersTable1662659212087';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "worker" ("id" SERIAL NOT NULL, "firstName" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "age" integer NOT NULL, CONSTRAINT "PK_dc8175fa0e34ce7a39e4ec73b94" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "employer" ("id" SERIAL NOT NULL, "firstName" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "age" integer NOT NULL, "businessName" character varying(255) NOT NULL, CONSTRAINT "PK_74029e6b1f17a4c7c66d43cfd34" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "address" character varying(255) NOT NULL, "city" character varying(255) NOT NULL, "state" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "profileImg" character varying(255) NOT NULL, "role" integer NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "employer"`);
    await queryRunner.query(`DROP TABLE "worker"`);
  }
}
