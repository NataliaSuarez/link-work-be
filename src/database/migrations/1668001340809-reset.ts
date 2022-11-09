import { MigrationInterface, QueryRunner } from 'typeorm';

export class reset1668001340809 implements MigrationInterface {
  name = 'reset1668001340809';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."workers_data_gender_enum" AS ENUM('0', '1', '2')`,
    );
    await queryRunner.query(
      `CREATE TABLE "workers_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dayOfBirth" integer NOT NULL, "monthOfBirth" integer NOT NULL, "yearOfBirth" integer NOT NULL, "phone" character varying(255) NOT NULL, "personalUrl" character varying(255) NOT NULL, "gender" "public"."workers_data_gender_enum" NOT NULL, "description" text NOT NULL, "ssn" integer NOT NULL, "stars" double precision NOT NULL DEFAULT '0', "totalReviews" integer NOT NULL DEFAULT '0', "avgStars" double precision NOT NULL DEFAULT '0', "stripeId" character varying(255), "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_aa219f4ae7074c3c10fe1d1a81" UNIQUE ("userId"), CONSTRAINT "PK_26d6f2003be216b07ee5e593aca" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."employers_data_businesscode_enum" AS ENUM('0', '1', '2')`,
    );
    await queryRunner.query(
      `CREATE TABLE "employers_data" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "businessCode" "public"."employers_data_businesscode_enum" NOT NULL DEFAULT '2', "businessName" character varying(255) NOT NULL, "businessUrl" character varying(255), "description" text, "stars" double precision NOT NULL DEFAULT '0', "totalReviews" integer NOT NULL DEFAULT '0', "avgStars" double precision NOT NULL DEFAULT '0', "customerId" character varying(255), "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_d8b5f173a5557a63a0f1a950e1" UNIQUE ("userId"), CONSTRAINT "PK_d895ebf354a33870f4d4e67d9a5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "address" character varying(255) NOT NULL, "city" character varying(255) NOT NULL, "state" character varying(255) NOT NULL, "postalCode" character varying(255) NOT NULL, "principal" boolean NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."offers_category_enum" AS ENUM('0', '1', '2', '3', '4')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."offers_status_enum" AS ENUM('0', '1', '2', '3')`,
    );
    await queryRunner.query(
      `CREATE TABLE "offers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "from" TIMESTAMP WITH TIME ZONE NOT NULL, "to" TIMESTAMP WITH TIME ZONE NOT NULL, "usdHour" integer NOT NULL, "usdTotal" integer NOT NULL, "category" "public"."offers_category_enum" NOT NULL, "description" text, "videoUrl" character varying(255), "status" "public"."offers_status_enum" NOT NULL DEFAULT '0', "applicantsCount" integer NOT NULL DEFAULT '0', "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "employerUserId" uuid, "addressId" uuid, CONSTRAINT "PK_4c88e956195bba85977da21b8f4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."shifts_status_enum" AS ENUM('0', '1', '2', '3', '4')`,
    );
    await queryRunner.query(
      `CREATE TABLE "shifts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "clockIn" boolean NOT NULL DEFAULT false, "confirmedClockIn" boolean NOT NULL DEFAULT false, "clockOut" boolean NOT NULL DEFAULT false, "confirmedClockOut" boolean NOT NULL DEFAULT false, "autoConfirmed" TIMESTAMP WITH TIME ZONE, "status" "public"."shifts_status_enum" NOT NULL DEFAULT '0', "workerUserId" uuid NOT NULL, "offerId" uuid NOT NULL, CONSTRAINT "REL_62fd9f0f516a0566261f2459b6" UNIQUE ("offerId"), CONSTRAINT "PK_84d692e367e4d6cdf045828768c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."clocks_histories_clocktype_enum" AS ENUM('1', '2')`,
    );
    await queryRunner.query(
      `CREATE TABLE "clocks_histories" ("id" SERIAL NOT NULL, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "clockType" "public"."clocks_histories_clocktype_enum" NOT NULL, "shiftId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_223e5978129100b231b728d4b01" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "business_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "imgUrl" character varying(255) NOT NULL, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "employerUserId" uuid NOT NULL, CONSTRAINT "PK_1397654990672fe8b832a015a4b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "worker_experiences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "videoUrl" character varying(255) NOT NULL, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "workerUserId" uuid, CONSTRAINT "REL_de08aedab5795258750d464bae" UNIQUE ("workerUserId"), CONSTRAINT "PK_c5dc036373b141394ea1d48a33e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_registertype_enum" AS ENUM('0', '1', '2')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('1', '2')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(255), "lastName" character varying(255), "email" character varying(255) NOT NULL, "password" character varying, "registerType" "public"."users_registertype_enum" NOT NULL DEFAULT '0', "verified" boolean NOT NULL DEFAULT false, "profileImg" character varying(255), "role" "public"."users_role_enum" NOT NULL, "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updateAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "desactivatedAt" TIMESTAMP, "refreshToken" character varying(255), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "offers_applicants" ("offersId" uuid NOT NULL, "usersId" uuid NOT NULL, CONSTRAINT "PK_1ae03ecf10d3ea6a6cb05031113" PRIMARY KEY ("offersId", "usersId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_078b0da3391d6b2b1eca7b6a92" ON "offers_applicants" ("offersId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b9229aaa1bc4096bf934157b9d" ON "offers_applicants" ("usersId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "workers_offers_favorites" ("offersId" uuid NOT NULL, "usersId" uuid NOT NULL, CONSTRAINT "PK_b2506fb2fba2e8c7a7cc20cd470" PRIMARY KEY ("offersId", "usersId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cfb7c2ecbdbaba5ae58234e195" ON "workers_offers_favorites" ("offersId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e3382031cff15b452a32aab434" ON "workers_offers_favorites" ("usersId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "workers_data" ADD CONSTRAINT "FK_aa219f4ae7074c3c10fe1d1a81f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "employers_data" ADD CONSTRAINT "FK_d8b5f173a5557a63a0f1a950e17" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_95c93a584de49f0b0e13f753630" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ADD CONSTRAINT "FK_0ac5c27dc478da2e0b16db2dd6e" FOREIGN KEY ("employerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ADD CONSTRAINT "FK_ae8fb8c34ed709ce2cfdc82acdc" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shifts" ADD CONSTRAINT "FK_0e9b66b73cf8d576e3a923b39f5" FOREIGN KEY ("workerUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shifts" ADD CONSTRAINT "FK_62fd9f0f516a0566261f2459b6a" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clocks_histories" ADD CONSTRAINT "FK_3101a37523108b1b226f524b465" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "clocks_histories" ADD CONSTRAINT "FK_fb69f16478c7de6aa45d0a6fb95" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "business_images" ADD CONSTRAINT "FK_a40f665bb02b742925dfad00aa7" FOREIGN KEY ("employerUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "worker_experiences" ADD CONSTRAINT "FK_de08aedab5795258750d464bae3" FOREIGN KEY ("workerUserId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" ADD CONSTRAINT "FK_078b0da3391d6b2b1eca7b6a92c" FOREIGN KEY ("offersId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" ADD CONSTRAINT "FK_b9229aaa1bc4096bf934157b9dd" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers_offers_favorites" ADD CONSTRAINT "FK_cfb7c2ecbdbaba5ae58234e195f" FOREIGN KEY ("offersId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers_offers_favorites" ADD CONSTRAINT "FK_e3382031cff15b452a32aab4349" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "workers_offers_favorites" DROP CONSTRAINT "FK_e3382031cff15b452a32aab4349"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers_offers_favorites" DROP CONSTRAINT "FK_cfb7c2ecbdbaba5ae58234e195f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" DROP CONSTRAINT "FK_b9229aaa1bc4096bf934157b9dd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers_applicants" DROP CONSTRAINT "FK_078b0da3391d6b2b1eca7b6a92c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "worker_experiences" DROP CONSTRAINT "FK_de08aedab5795258750d464bae3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "business_images" DROP CONSTRAINT "FK_a40f665bb02b742925dfad00aa7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clocks_histories" DROP CONSTRAINT "FK_fb69f16478c7de6aa45d0a6fb95"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clocks_histories" DROP CONSTRAINT "FK_3101a37523108b1b226f524b465"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shifts" DROP CONSTRAINT "FK_62fd9f0f516a0566261f2459b6a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shifts" DROP CONSTRAINT "FK_0e9b66b73cf8d576e3a923b39f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" DROP CONSTRAINT "FK_ae8fb8c34ed709ce2cfdc82acdc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" DROP CONSTRAINT "FK_0ac5c27dc478da2e0b16db2dd6e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_95c93a584de49f0b0e13f753630"`,
    );
    await queryRunner.query(
      `ALTER TABLE "employers_data" DROP CONSTRAINT "FK_d8b5f173a5557a63a0f1a950e17"`,
    );
    await queryRunner.query(
      `ALTER TABLE "workers_data" DROP CONSTRAINT "FK_aa219f4ae7074c3c10fe1d1a81f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e3382031cff15b452a32aab434"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cfb7c2ecbdbaba5ae58234e195"`,
    );
    await queryRunner.query(`DROP TABLE "workers_offers_favorites"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b9229aaa1bc4096bf934157b9d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_078b0da3391d6b2b1eca7b6a92"`,
    );
    await queryRunner.query(`DROP TABLE "offers_applicants"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_registertype_enum"`);
    await queryRunner.query(`DROP TABLE "worker_experiences"`);
    await queryRunner.query(`DROP TABLE "business_images"`);
    await queryRunner.query(`DROP TABLE "clocks_histories"`);
    await queryRunner.query(
      `DROP TYPE "public"."clocks_histories_clocktype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "shifts"`);
    await queryRunner.query(`DROP TYPE "public"."shifts_status_enum"`);
    await queryRunner.query(`DROP TABLE "offers"`);
    await queryRunner.query(`DROP TYPE "public"."offers_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."offers_category_enum"`);
    await queryRunner.query(`DROP TABLE "addresses"`);
    await queryRunner.query(`DROP TABLE "employers_data"`);
    await queryRunner.query(
      `DROP TYPE "public"."employers_data_businesscode_enum"`,
    );
    await queryRunner.query(`DROP TABLE "workers_data"`);
    await queryRunner.query(`DROP TYPE "public"."workers_data_gender_enum"`);
  }
}
