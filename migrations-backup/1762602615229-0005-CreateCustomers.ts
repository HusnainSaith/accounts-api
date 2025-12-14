import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomers1762602615229 implements MigrationInterface {
  name = 'CreateCustomers1762602615229';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE customer_type_enum AS ENUM ('individual', 'business');
    `);

    await queryRunner.query(`
      CREATE TABLE customers (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        customer_type       customer_type_enum NOT NULL,
        name                varchar(255) NOT NULL,
        email               varchar(255),
        phone               varchar(50),
        trn                 varchar(64),
        address             text,
        city                varchar(255),
        country_code        varchar(3),
        is_vat_registered   boolean NOT NULL DEFAULT false,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE customers;`);
    await queryRunner.query(`DROP TYPE customer_type_enum;`);
  }
}
