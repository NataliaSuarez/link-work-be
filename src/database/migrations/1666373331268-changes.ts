import { MigrationInterface, QueryRunner } from 'typeorm';

export class changes1666373331268 implements MigrationInterface {
  name = 'changes1666373331268';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employers" ADD "avgStars" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers" ADD "avgStars" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "employers" DROP COLUMN "stars"`);
    await queryRunner.query(
      `ALTER TABLE "employers" ADD "stars" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "workers" DROP COLUMN "stars"`);
    await queryRunner.query(
      `ALTER TABLE "workers" ADD "stars" double precision NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers" ALTER COLUMN "totalReviews" SET DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workers" ALTER COLUMN "totalReviews" DROP DEFAULT`,
    );
    await queryRunner.query(`ALTER TABLE "workers" DROP COLUMN "stars"`);
    await queryRunner.query(
      `ALTER TABLE "workers" ADD "stars" integer NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "employers" DROP COLUMN "stars"`);
    await queryRunner.query(
      `ALTER TABLE "employers" ADD "stars" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "workers" DROP COLUMN "avgStars"`);
    await queryRunner.query(`ALTER TABLE "employers" DROP COLUMN "avgStars"`);
  }
}
