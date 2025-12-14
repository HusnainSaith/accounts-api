import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateItems1762602616232 implements MigrationInterface {
  name = 'CreateItems1762602616232';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE items (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        item_code           varchar(100),
        name                varchar(255) NOT NULL,
        description         text,
        category            varchar(255),
        unit_price          numeric(18,4) NOT NULL,
        currency_code       varchar(3) NOT NULL,
        default_vat_rate    numeric(5,2),
        is_service          boolean NOT NULL DEFAULT true,
        is_active           boolean NOT NULL DEFAULT true,
        ai_suggested        boolean NOT NULL DEFAULT false,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE items;`);
  }
}
