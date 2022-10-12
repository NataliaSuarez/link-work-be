import { MigrationInterface, QueryRunner } from 'typeorm';

export class userDeactivate1665589059718 implements MigrationInterface {
  name = 'userDeactivate1665589059718';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "deactivatedAt" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deactivatedAt"`);
  }
}
