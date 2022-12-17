import { MigrationInterface, QueryRunner } from "typeorm";

export class changes1671234317758 implements MigrationInterface {
    name = 'changes1671234317758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "googleIdIdentifier" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "googleIdIdentifier"`);
    }

}
