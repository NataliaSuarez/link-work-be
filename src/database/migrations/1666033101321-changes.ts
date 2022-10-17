import { MigrationInterface, QueryRunner } from 'typeorm';

export class changes1666033101321 implements MigrationInterface {
  name = 'changes1666033101321';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offers" ADD "videoUrl" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ALTER COLUMN "description" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offers" ALTER COLUMN "description" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "videoUrl"`);
  }
}
