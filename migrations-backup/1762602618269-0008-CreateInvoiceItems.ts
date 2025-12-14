import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvoiceItems1762602618269 implements MigrationInterface {
  name = 'CreateInvoiceItems1762602618269';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE invoice_items (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id          uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        item_id             uuid REFERENCES items(id),
        description         text NOT NULL,
        quantity            numeric(18,4) NOT NULL,
        unit_price          numeric(18,4) NOT NULL,
        discount_percentage numeric(5,2) NOT NULL DEFAULT 0,
        vat_rate            numeric(5,2) NOT NULL,
        line_total          numeric(18,2) NOT NULL,
        line_vat_amount     numeric(18,2) NOT NULL,
        sort_order          integer NOT NULL,
        created_at          timestamp NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE invoice_items;`);
  }
}
