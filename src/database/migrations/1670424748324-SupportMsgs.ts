import { MigrationInterface, QueryRunner } from 'typeorm';

export class SupportMsgs1670424748324 implements MigrationInterface {
  name = 'SupportMsgs1670424748324';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "support_msgs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "msg" text NOT NULL, "sended" TIMESTAMP WITH TIME ZONE NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_1a6faa2526c5989ea615b6903cc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "support_msgs" ADD CONSTRAINT "FK_3cdaa1280c129c5fe2d365ee16d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "support_msgs" DROP CONSTRAINT "FK_3cdaa1280c129c5fe2d365ee16d"`,
    );
    await queryRunner.query(`DROP TABLE "support_msgs"`);
  }
}
