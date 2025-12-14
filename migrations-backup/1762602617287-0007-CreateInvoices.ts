import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvoices1762602617287 implements MigrationInterface {
  name = 'CreateInvoices1762602617287';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE invoice_type_enum AS ENUM ('full', 'simplified');`,
    );
    await queryRunner.query(
      `CREATE TYPE invoice_status_enum AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');`,
    );

    await queryRunner.query(`
      CREATE TABLE invoices (
        id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id              uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        customer_id             uuid NOT NULL REFERENCES customers(id),
        invoice_number          varchar(100) NOT NULL,
        invoice_type            invoice_type_enum NOT NULL,
        status                  invoice_status_enum NOT NULL DEFAULT 'draft',

        due_date                date,
        supply_date             date,
        subtotal                numeric(18,2) NOT NULL,
        vat_rate                numeric(5,2) NOT NULL,
        vat_amount              numeric(18,2) NOT NULL,
        discount_amount         numeric(18,2) NOT NULL DEFAULT 0,
        total_amount            numeric(18,2) NOT NULL,
        currency_code           varchar(3) NOT NULL,
        exchange_rate_to_aed    numeric(18,6),
        notes                   text,
        payment_method          varchar(255),
        pdf_path                varchar(500),
        qr_code_data            text,
        created_by              uuid REFERENCES users(id),
        created_at              timestamp NOT NULL DEFAULT now(),
        updated_at              timestamp NOT NULL DEFAULT now(),

        paid_at                 timestamp,
        UNIQUE (company_id, invoice_number)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE invoices;`);
    await queryRunner.query(`DROP TYPE invoice_status_enum;`);
    await queryRunner.query(`DROP TYPE invoice_type_enum;`);
  }
}
