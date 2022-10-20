import { MigrationInterface, QueryRunner } from 'typeorm';

export class changes1666293200489 implements MigrationInterface {
  name = 'changes1666293200489';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "business_images" ("id" SERIAL NOT NULL, "imgUrl" character varying(255) NOT NULL, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "employerId" integer NOT NULL, CONSTRAINT "PK_1397654990672fe8b832a015a4b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "business_images" ADD CONSTRAINT "FK_f7706c34b3bfcc33eaff3099e6b" FOREIGN KEY ("employerId") REFERENCES "employers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "business_images" DROP CONSTRAINT "FK_f7706c34b3bfcc33eaff3099e6b"`,
    );
    await queryRunner.query(`DROP TABLE "business_images"`);
  }
}
