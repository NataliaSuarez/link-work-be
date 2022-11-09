import { MigrationInterface, QueryRunner } from 'typeorm';

export class changes1667335273689 implements MigrationInterface {
  name = 'changes1667335273689';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "offers" ADD "addressId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "offers" ADD CONSTRAINT "FK_ae8fb8c34ed709ce2cfdc82acdc" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offers" DROP CONSTRAINT "FK_ae8fb8c34ed709ce2cfdc82acdc"`,
    );
    await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "addressId"`);
  }
}
