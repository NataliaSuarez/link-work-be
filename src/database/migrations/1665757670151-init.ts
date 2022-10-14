import { MigrationInterface, QueryRunner } from "typeorm";

export class init1665757670151 implements MigrationInterface {
    name = 'init1665757670151'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."employers_businesscode_enum" AS ENUM('0', '1', '2')`);
        await queryRunner.query(`CREATE TABLE "employers" ("id" SERIAL NOT NULL, "address" character varying(255) NOT NULL, "city" character varying(255) NOT NULL, "state" character varying(255) NOT NULL, "businessCode" "public"."employers_businesscode_enum" NOT NULL, "businessName" character varying(255) NOT NULL, "description" text NOT NULL, "stars" integer NOT NULL, "totalReviews" integer NOT NULL, "customerId" character varying(255) NOT NULL, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_91fb7c4cd23362d14b79b72a6f" UNIQUE ("userId"), CONSTRAINT "PK_f2c1aea3e8d7aa3c5fba949c97d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."clocks_histories_clocktype_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`CREATE TABLE "clocks_histories" ("id" SERIAL NOT NULL, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "clockType" "public"."clocks_histories_clocktype_enum" NOT NULL, "shiftId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_223e5978129100b231b728d4b01" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."shifts_status_enum" AS ENUM('0', '1', '2', '3', '4')`);
        await queryRunner.query(`CREATE TABLE "shifts" ("id" SERIAL NOT NULL, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "clockIn" boolean NOT NULL DEFAULT false, "confirmedClockIn" boolean NOT NULL DEFAULT false, "clockOut" boolean NOT NULL DEFAULT false, "confirmedClockOut" boolean NOT NULL DEFAULT false, "autoConfirmed" TIMESTAMP WITH TIME ZONE, "status" "public"."shifts_status_enum" NOT NULL DEFAULT '0', "workerId" integer NOT NULL, "offerId" integer NOT NULL, CONSTRAINT "REL_62fd9f0f516a0566261f2459b6" UNIQUE ("offerId"), CONSTRAINT "PK_84d692e367e4d6cdf045828768c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."offers_category_enum" AS ENUM('0', '1', '2', '3', '4')`);
        await queryRunner.query(`CREATE TYPE "public"."offers_status_enum" AS ENUM('0', '1', '2', '3')`);
        await queryRunner.query(`CREATE TABLE "offers" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "from" TIMESTAMP WITH TIME ZONE NOT NULL, "to" TIMESTAMP WITH TIME ZONE NOT NULL, "usdHour" integer NOT NULL, "usdTotal" integer NOT NULL, "category" "public"."offers_category_enum" NOT NULL, "description" text NOT NULL, "status" "public"."offers_status_enum" NOT NULL DEFAULT '0', "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "employerId" integer NOT NULL, CONSTRAINT "PK_4c88e956195bba85977da21b8f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "work_experiences" ("id" SERIAL NOT NULL, "description" text NOT NULL, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "workerId" integer, CONSTRAINT "PK_3189db15aaccc2861851ea3da17" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."workers_gender_enum" AS ENUM('0', '1', '2')`);
        await queryRunner.query(`CREATE TABLE "workers" ("id" SERIAL NOT NULL, "address" character varying(255) NOT NULL, "city" character varying(255) NOT NULL, "state" character varying(255) NOT NULL, "postalCode" character varying(255) NOT NULL, "dayOfBirth" integer NOT NULL, "monthOfBirth" integer NOT NULL, "yearOfBirth" integer NOT NULL, "phone" character varying(255) NOT NULL, "personalUrl" character varying(255) NOT NULL, "gender" "public"."workers_gender_enum" NOT NULL, "description" text NOT NULL, "ssn" integer NOT NULL, "stars" integer NOT NULL, "totalReviews" integer NOT NULL, "stripeId" character varying(255) NOT NULL, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "REL_fdefd9252e90173f66271f76b9" UNIQUE ("userId"), CONSTRAINT "PK_e950c9aba3bd84a4f193058d838" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_registertype_enum" AS ENUM('0', '1', '2')`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('1', '2')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "firstName" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying, "registerType" "public"."users_registertype_enum" NOT NULL DEFAULT '0', "verified" boolean NOT NULL DEFAULT false, "profileImg" character varying(255), "role" "public"."users_role_enum" NOT NULL, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deactivatedAt" TIMESTAMP, "refreshToken" character varying(255), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "workers_offers_offers" ("workersId" integer NOT NULL, "offersId" integer NOT NULL, CONSTRAINT "PK_189bfe34967e834657a2f6b49fb" PRIMARY KEY ("workersId", "offersId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_86319b5ebf8b92a8eb254cf61d" ON "workers_offers_offers" ("workersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_481a8a8c6a24c93f99accf48ee" ON "workers_offers_offers" ("offersId") `);
        await queryRunner.query(`ALTER TABLE "employers" ADD CONSTRAINT "FK_91fb7c4cd23362d14b79b72a6f4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "clocks_histories" ADD CONSTRAINT "FK_3101a37523108b1b226f524b465" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "clocks_histories" ADD CONSTRAINT "FK_fb69f16478c7de6aa45d0a6fb95" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shifts" ADD CONSTRAINT "FK_e9992e51b7374929060284ed5df" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shifts" ADD CONSTRAINT "FK_62fd9f0f516a0566261f2459b6a" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "offers" ADD CONSTRAINT "FK_9190426268e504959c957371fe3" FOREIGN KEY ("employerId") REFERENCES "employers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "work_experiences" ADD CONSTRAINT "FK_92922c5cdcfb1d60b3eff159d09" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workers" ADD CONSTRAINT "FK_fdefd9252e90173f66271f76b96" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "workers_offers_offers" ADD CONSTRAINT "FK_86319b5ebf8b92a8eb254cf61dd" FOREIGN KEY ("workersId") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "workers_offers_offers" ADD CONSTRAINT "FK_481a8a8c6a24c93f99accf48eea" FOREIGN KEY ("offersId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workers_offers_offers" DROP CONSTRAINT "FK_481a8a8c6a24c93f99accf48eea"`);
        await queryRunner.query(`ALTER TABLE "workers_offers_offers" DROP CONSTRAINT "FK_86319b5ebf8b92a8eb254cf61dd"`);
        await queryRunner.query(`ALTER TABLE "workers" DROP CONSTRAINT "FK_fdefd9252e90173f66271f76b96"`);
        await queryRunner.query(`ALTER TABLE "work_experiences" DROP CONSTRAINT "FK_92922c5cdcfb1d60b3eff159d09"`);
        await queryRunner.query(`ALTER TABLE "offers" DROP CONSTRAINT "FK_9190426268e504959c957371fe3"`);
        await queryRunner.query(`ALTER TABLE "shifts" DROP CONSTRAINT "FK_62fd9f0f516a0566261f2459b6a"`);
        await queryRunner.query(`ALTER TABLE "shifts" DROP CONSTRAINT "FK_e9992e51b7374929060284ed5df"`);
        await queryRunner.query(`ALTER TABLE "clocks_histories" DROP CONSTRAINT "FK_fb69f16478c7de6aa45d0a6fb95"`);
        await queryRunner.query(`ALTER TABLE "clocks_histories" DROP CONSTRAINT "FK_3101a37523108b1b226f524b465"`);
        await queryRunner.query(`ALTER TABLE "employers" DROP CONSTRAINT "FK_91fb7c4cd23362d14b79b72a6f4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_481a8a8c6a24c93f99accf48ee"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_86319b5ebf8b92a8eb254cf61d"`);
        await queryRunner.query(`DROP TABLE "workers_offers_offers"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_registertype_enum"`);
        await queryRunner.query(`DROP TABLE "workers"`);
        await queryRunner.query(`DROP TYPE "public"."workers_gender_enum"`);
        await queryRunner.query(`DROP TABLE "work_experiences"`);
        await queryRunner.query(`DROP TABLE "offers"`);
        await queryRunner.query(`DROP TYPE "public"."offers_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."offers_category_enum"`);
        await queryRunner.query(`DROP TABLE "shifts"`);
        await queryRunner.query(`DROP TYPE "public"."shifts_status_enum"`);
        await queryRunner.query(`DROP TABLE "clocks_histories"`);
        await queryRunner.query(`DROP TYPE "public"."clocks_histories_clocktype_enum"`);
        await queryRunner.query(`DROP TABLE "employers"`);
        await queryRunner.query(`DROP TYPE "public"."employers_businesscode_enum"`);
    }

}
