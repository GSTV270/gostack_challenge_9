import {MigrationInterface, QueryRunner} from "typeorm";

export class updateFieldsToDecimal1591892433699 implements MigrationInterface {
    name = 'updateFieldsToDecimal1591892433699'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders_products" DROP COLUMN "price"`, undefined);
        await queryRunner.query(`ALTER TABLE "orders_products" ADD "price" numeric(10,2) NOT NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders_products" DROP COLUMN "price"`, undefined);
        await queryRunner.query(`ALTER TABLE "orders_products" ADD "price" integer NOT NULL`, undefined);
    }

}
