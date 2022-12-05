import { MigrationInterface, QueryRunner } from 'typeorm';

export class manytomany1670270039123 implements MigrationInterface {
  name = 'manytomany1670270039123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" DROP CONSTRAINT "FK_078b0da3391d6b2b1eca7b6a92c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" DROP CONSTRAINT "FK_b9229aaa1bc4096bf934157b9dd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_078b0da3391d6b2b1eca7b6a92"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b9229aaa1bc4096bf934157b9d"`,
    );
    await queryRunner.query(
      `CREATE TABLE "offers_favorited_users" ("offer_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_9f5df34a9cab2b783cf821cbfd7" PRIMARY KEY ("offer_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d5a7e556d0d4f86d0f924c6810" ON "offers_favorited_users" ("offer_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_357ff2c6ee332fac547b41600f" ON "offers_favorited_users" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" DROP CONSTRAINT "PK_1ae03ecf10d3ea6a6cb05031113"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" ADD CONSTRAINT "PK_b9229aaa1bc4096bf934157b9dd" PRIMARY KEY ("usersId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" DROP COLUMN "offersId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" DROP CONSTRAINT "PK_b9229aaa1bc4096bf934157b9dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" DROP COLUMN "usersId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" ADD "offer_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" ADD CONSTRAINT "PK_ad3bdc0e8571a3d0c1214573f29" PRIMARY KEY ("offer_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" ADD "user_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" DROP CONSTRAINT "PK_ad3bdc0e8571a3d0c1214573f29"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" ADD CONSTRAINT "PK_4752b9650a7e123efb702859646" PRIMARY KEY ("offer_id", "user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ad3bdc0e8571a3d0c1214573f2" ON "offers_applicants" ("offer_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_25f90c80f30e05b8b049b0820d" ON "offers_applicants" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" ADD CONSTRAINT "FK_ad3bdc0e8571a3d0c1214573f29" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" ADD CONSTRAINT "FK_25f90c80f30e05b8b049b0820df" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_favorited_users" ADD CONSTRAINT "FK_d5a7e556d0d4f86d0f924c68100" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_favorited_users" ADD CONSTRAINT "FK_357ff2c6ee332fac547b41600f7" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offers_favorited_users" DROP CONSTRAINT "FK_357ff2c6ee332fac547b41600f7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_favorited_users" DROP CONSTRAINT "FK_d5a7e556d0d4f86d0f924c68100"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" DROP CONSTRAINT "FK_25f90c80f30e05b8b049b0820df"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" DROP CONSTRAINT "FK_ad3bdc0e8571a3d0c1214573f29"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_25f90c80f30e05b8b049b0820d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ad3bdc0e8571a3d0c1214573f2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" DROP CONSTRAINT "PK_4752b9650a7e123efb702859646"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" ADD CONSTRAINT "PK_ad3bdc0e8571a3d0c1214573f29" PRIMARY KEY ("offer_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" DROP COLUMN "user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" DROP CONSTRAINT "PK_ad3bdc0e8571a3d0c1214573f29"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" DROP COLUMN "offer_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" ADD "usersId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" ADD CONSTRAINT "PK_b9229aaa1bc4096bf934157b9dd" PRIMARY KEY ("usersId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" ADD "offersId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" DROP CONSTRAINT "PK_b9229aaa1bc4096bf934157b9dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" ADD CONSTRAINT "PK_1ae03ecf10d3ea6a6cb05031113" PRIMARY KEY ("offersId", "usersId")`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_357ff2c6ee332fac547b41600f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d5a7e556d0d4f86d0f924c6810"`,
    );
    await queryRunner.query(`DROP TABLE "offers_favorited_users"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_b9229aaa1bc4096bf934157b9d" ON "offers_applicants" ("usersId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_078b0da3391d6b2b1eca7b6a92" ON "offers_applicants" ("offersId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" ADD CONSTRAINT "FK_b9229aaa1bc4096bf934157b9dd" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" ADD CONSTRAINT "FK_078b0da3391d6b2b1eca7b6a92c" FOREIGN KEY ("offersId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
