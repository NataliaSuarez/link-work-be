import { MigrationInterface, QueryRunner } from 'typeorm';

export class changes1666210657651 implements MigrationInterface {
  name = 'changes1666210657651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employers" ALTER COLUMN "businessCode" SET DEFAULT '2'`,
    );
    await queryRunner.query(
      `ALTER TABLE "employers" ALTER COLUMN "description" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "employers" ALTER COLUMN "stars" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "employers" ALTER COLUMN "totalReviews" SET DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "employers" ALTER COLUMN "customerId" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employers" ALTER COLUMN "customerId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "employers" ALTER COLUMN "totalReviews" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "employers" ALTER COLUMN "stars" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "employers" ALTER COLUMN "description" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "employers" ALTER COLUMN "businessCode" DROP DEFAULT`,
    );
  }
}
