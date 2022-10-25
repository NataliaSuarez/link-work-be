import { MigrationInterface, QueryRunner } from 'typeorm';

export class changes1666647550623 implements MigrationInterface {
  name = 'changes1666647550623';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "addresses" ("id" SERIAL NOT NULL, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "street" character varying(255) NOT NULL, "number" integer NOT NULL, "city" character varying(255) NOT NULL, "state" character varying(255) NOT NULL, "postalCode" character varying(255) NOT NULL, "principal" boolean NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "employers" DROP COLUMN "address"`);
    await queryRunner.query(`ALTER TABLE "employers" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "employers" DROP COLUMN "state"`);
    await queryRunner.query(`ALTER TABLE "workers" DROP COLUMN "address"`);
    await queryRunner.query(`ALTER TABLE "workers" DROP COLUMN "city"`);
    await queryRunner.query(`ALTER TABLE "workers" DROP COLUMN "state"`);
    await queryRunner.query(`ALTER TABLE "workers" DROP COLUMN "postalCode"`);
    await queryRunner.query(
      `ALTER TABLE "employers" ADD "businessUrl" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_95c93a584de49f0b0e13f753630" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_95c93a584de49f0b0e13f753630"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employers" DROP COLUMN "businessUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers" ADD "postalCode" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers" ADD "state" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers" ADD "city" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers" ADD "address" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "employers" ADD "state" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "employers" ADD "city" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "employers" ADD "address" character varying(255) NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "addresses"`);
  }
}
