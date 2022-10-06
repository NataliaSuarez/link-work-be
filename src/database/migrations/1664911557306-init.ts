import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1664911557306 implements MigrationInterface {
  name = 'init1664911557306';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."employer_businesscode_enum" AS ENUM('0', '1', '2')`,
    );
    await queryRunner.query(
      `CREATE TABLE "employer" ("id" SERIAL NOT NULL, "address" character varying(255) NOT NULL, "city" character varying(255) NOT NULL, "state" character varying(255) NOT NULL, "businessCode" "public"."employer_businesscode_enum" NOT NULL, "businessName" character varying(255) NOT NULL, "description" text NOT NULL, "stars" integer NOT NULL, "totalReviews" integer NOT NULL, "customerId" character varying(255) NOT NULL, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_bf0894d837af561b2f63387499" UNIQUE ("userId"), CONSTRAINT "PK_74029e6b1f17a4c7c66d43cfd34" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shift_status_enum" AS ENUM('0', '1', '2', '3', '4')`,
    );
    await queryRunner.query(
      `CREATE TABLE "shift" ("id" SERIAL NOT NULL, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "clockIn" boolean NOT NULL DEFAULT false, "confirmedClockIn" boolean NOT NULL DEFAULT false, "clockOut" boolean NOT NULL DEFAULT false, "confirmedClockOut" boolean NOT NULL DEFAULT false, "autoConfirmed" date, "status" "public"."shift_status_enum" NOT NULL DEFAULT '0', "workerId" integer NOT NULL, "offerId" integer NOT NULL, CONSTRAINT "REL_62be1e0c53b77c2ec2a34ff525" UNIQUE ("offerId"), CONSTRAINT "PK_53071a6485a1e9dc75ec3db54b9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."offer_category_enum" AS ENUM('0', '1', '2', '3', '4')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."offer_status_enum" AS ENUM('0', '1', '2', '3')`,
    );
    await queryRunner.query(
      `CREATE TABLE "offer" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "from" TIMESTAMP WITH TIME ZONE NOT NULL, "to" TIMESTAMP WITH TIME ZONE NOT NULL, "usdHour" integer NOT NULL, "usdTotal" integer NOT NULL, "category" "public"."offer_category_enum" NOT NULL, "description" text NOT NULL, "status" "public"."offer_status_enum" NOT NULL DEFAULT '0', "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "employerId" integer NOT NULL, CONSTRAINT "PK_57c6ae1abe49201919ef68de900" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "work_experience" ("id" SERIAL NOT NULL, "description" text NOT NULL, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "workerId" integer, CONSTRAINT "PK_d4bef63ad6da7ec327515c121bd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."worker_gender_enum" AS ENUM('0', '1', '2')`,
    );
    await queryRunner.query(
      `CREATE TABLE "worker" ("id" SERIAL NOT NULL, "address" character varying(255) NOT NULL, "city" character varying(255) NOT NULL, "state" character varying(255) NOT NULL, "age" integer NOT NULL, "gender" "public"."worker_gender_enum" NOT NULL, "description" text NOT NULL, "ssn" integer NOT NULL, "stars" integer NOT NULL, "totalReviews" integer NOT NULL, "stripeId" character varying(255) NOT NULL, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_b4fc7927de11f45e2ecca71726" UNIQUE ("userId"), CONSTRAINT "PK_dc8175fa0e34ce7a39e4ec73b94" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_registertype_enum" AS ENUM('0', '1', '2')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('1', '2')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" SERIAL NOT NULL, "firstName" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying, "registerType" "public"."users_registertype_enum" NOT NULL DEFAULT '0', "verified" boolean NOT NULL DEFAULT false, "profileImg" character varying(255), "role" "public"."users_role_enum" NOT NULL, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "refreshToken" character varying(255), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "worker_offers_offer" ("workerId" integer NOT NULL, "offerId" integer NOT NULL, CONSTRAINT "PK_7e960b1fe254d49c5668d9a60a6" PRIMARY KEY ("workerId", "offerId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1668d2fd21658cf4df527c6b0a" ON "worker_offers_offer" ("workerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ae9666e45faf9c21a6a73f2f93" ON "worker_offers_offer" ("offerId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "employer" ADD CONSTRAINT "FK_bf0894d837af561b2f633874993" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD CONSTRAINT "FK_e92c86730c5f4ff2a700302b7ee" FOREIGN KEY ("workerId") REFERENCES "worker"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" ADD CONSTRAINT "FK_62be1e0c53b77c2ec2a34ff5259" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" ADD CONSTRAINT "FK_1e20b6aea6a5df9f872fa8ceba9" FOREIGN KEY ("employerId") REFERENCES "employer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_experience" ADD CONSTRAINT "FK_e7066309f1ec345e6e65271c3f3" FOREIGN KEY ("workerId") REFERENCES "worker"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "worker" ADD CONSTRAINT "FK_b4fc7927de11f45e2ecca71726b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "worker_offers_offer" ADD CONSTRAINT "FK_1668d2fd21658cf4df527c6b0a6" FOREIGN KEY ("workerId") REFERENCES "worker"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "worker_offers_offer" ADD CONSTRAINT "FK_ae9666e45faf9c21a6a73f2f938" FOREIGN KEY ("offerId") REFERENCES "offer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "worker_offers_offer" DROP CONSTRAINT "FK_ae9666e45faf9c21a6a73f2f938"`,
    );
    await queryRunner.query(
      `ALTER TABLE "worker_offers_offer" DROP CONSTRAINT "FK_1668d2fd21658cf4df527c6b0a6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "worker" DROP CONSTRAINT "FK_b4fc7927de11f45e2ecca71726b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "work_experience" DROP CONSTRAINT "FK_e7066309f1ec345e6e65271c3f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer" DROP CONSTRAINT "FK_1e20b6aea6a5df9f872fa8ceba9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP CONSTRAINT "FK_62be1e0c53b77c2ec2a34ff5259"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shift" DROP CONSTRAINT "FK_e92c86730c5f4ff2a700302b7ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employer" DROP CONSTRAINT "FK_bf0894d837af561b2f633874993"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ae9666e45faf9c21a6a73f2f93"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1668d2fd21658cf4df527c6b0a"`,
    );
    await queryRunner.query(`DROP TABLE "worker_offers_offer"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_registertype_enum"`);
    await queryRunner.query(`DROP TABLE "worker"`);
    await queryRunner.query(`DROP TYPE "public"."worker_gender_enum"`);
    await queryRunner.query(`DROP TABLE "work_experience"`);
    await queryRunner.query(`DROP TABLE "offer"`);
    await queryRunner.query(`DROP TYPE "public"."offer_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."offer_category_enum"`);
    await queryRunner.query(`DROP TABLE "shift"`);
    await queryRunner.query(`DROP TYPE "public"."shift_status_enum"`);
    await queryRunner.query(`DROP TABLE "employer"`);
    await queryRunner.query(`DROP TYPE "public"."employer_businesscode_enum"`);
  }
}
