import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompanies1762602613008 implements MigrationInterface {
  name = 'CreateCompanies1762602613008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE companies (
        id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name              varchar(255) NOT NULL,
        country_code      varchar(3) NOT NULL,
        currency_code     varchar(3) NOT NULL,
        vat_rate          decimal(5,2) NOT NULL,
        trn               varchar(64),
        cr_number         varchar(100),
        logo_url          varchar(500),
        address           text,
        phone             varchar(50),
        email             varchar(255),
        created_at        timestamp NOT NULL DEFAULT now(),
        updated_at        timestamp NOT NULL DEFAULT now(),
        is_active         boolean NOT NULL DEFAULT true,
        is_test_account   boolean NOT NULL DEFAULT false
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE companies;`);
  }
}
