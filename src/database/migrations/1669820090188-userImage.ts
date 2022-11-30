import { MigrationInterface, QueryRunner } from 'typeorm';

export class userImage1669820090188 implements MigrationInterface {
  name = 'userImage1669820090188';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "imgUrl" character varying(255) NOT NULL, "avatar" boolean NOT NULL, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_8c5d93e1b746bef23c0cf9aa3a6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profileImg"`);
    await queryRunner.query(
      `ALTER TABLE "user_images" ADD CONSTRAINT "FK_e82761c6ff8ebd2e7c90958e87d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_images" DROP CONSTRAINT "FK_e82761c6ff8ebd2e7c90958e87d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "profileImg" character varying(255)`,
    );
    await queryRunner.query(`DROP TABLE "user_images"`);
  }
}
