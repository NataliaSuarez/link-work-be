import { MigrationInterface, QueryRunner } from 'typeorm';

export class nullable1667396407382 implements MigrationInterface {
  name = 'nullable1667396407382';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workers_data" ALTER COLUMN "stripeId" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workers_data" ALTER COLUMN "stripeId" SET NOT NULL`,
    );
  }
}
