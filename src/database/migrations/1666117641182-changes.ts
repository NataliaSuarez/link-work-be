import { MigrationInterface, QueryRunner } from 'typeorm';

export class changes1666117641182 implements MigrationInterface {
  name = 'changes1666117641182';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "work_experiences" DROP CONSTRAINT "FK_92922c5cdcfb1d60b3eff159d09"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_experiences" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_experiences" ADD "videoUrl" character varying(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "workers" ADD "workerId" integer`);
    await queryRunner.query(
      `ALTER TABLE "workers" ADD CONSTRAINT "UQ_f1ced5a89e82eaa72c012bd2121" UNIQUE ("workerId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_experiences" ALTER COLUMN "workerId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_experiences" ADD CONSTRAINT "UQ_92922c5cdcfb1d60b3eff159d09" UNIQUE ("workerId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_experiences" ADD CONSTRAINT "FK_92922c5cdcfb1d60b3eff159d09" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers" ADD CONSTRAINT "FK_f1ced5a89e82eaa72c012bd2121" FOREIGN KEY ("workerId") REFERENCES "work_experiences"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workers" DROP CONSTRAINT "FK_f1ced5a89e82eaa72c012bd2121"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_experiences" DROP CONSTRAINT "FK_92922c5cdcfb1d60b3eff159d09"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_experiences" DROP CONSTRAINT "UQ_92922c5cdcfb1d60b3eff159d09"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_experiences" ALTER COLUMN "workerId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers" DROP CONSTRAINT "UQ_f1ced5a89e82eaa72c012bd2121"`,
    );
    await queryRunner.query(`ALTER TABLE "workers" DROP COLUMN "workerId"`);
    await queryRunner.query(
      `ALTER TABLE "work_experiences" DROP COLUMN "videoUrl"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_experiences" ADD "description" text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_experiences" ADD CONSTRAINT "FK_92922c5cdcfb1d60b3eff159d09" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
