import { MigrationInterface, QueryRunner } from 'typeorm';

export class changes1670269118630 implements MigrationInterface {
  name = 'changes1670269118630';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" DROP CONSTRAINT "FK_b9229aaa1bc4096bf934157b9dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers_offers_favorites" DROP CONSTRAINT "FK_e3382031cff15b452a32aab4349"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" ADD CONSTRAINT "FK_b9229aaa1bc4096bf934157b9dd" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers_offers_favorites" ADD CONSTRAINT "FK_e3382031cff15b452a32aab4349" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workers_offers_favorites" DROP CONSTRAINT "FK_e3382031cff15b452a32aab4349"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" DROP CONSTRAINT "FK_b9229aaa1bc4096bf934157b9dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers_offers_favorites" ADD CONSTRAINT "FK_e3382031cff15b452a32aab4349" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" ADD CONSTRAINT "FK_b9229aaa1bc4096bf934157b9dd" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
