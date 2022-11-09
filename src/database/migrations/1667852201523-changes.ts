import { MigrationInterface, QueryRunner } from 'typeorm';

export class changes1667852201523 implements MigrationInterface {
  name = 'changes1667852201523';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "deactivatedAt" TO "desactivatedAt"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "desactivatedAt" TO "deactivatedAt"`,
    );
  }
}
