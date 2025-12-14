import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvoiceSettings1762602622331 implements MigrationInterface {
  name = 'CreateInvoiceSettings1762602622331';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE invoice_settings (
        id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id                  uuid NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
        next_invoice_number         integer NOT NULL,
        invoice_prefix              varchar(50) NOT NULL,
        invoice_number_format       varchar(100) NOT NULL,
        default_payment_terms_days  integer,
        default_notes               text,
        include_company_logo        boolean NOT NULL DEFAULT true,
        auto_send_on_create         boolean NOT NULL DEFAULT false,
        enable_qr_code              boolean NOT NULL DEFAULT false,
        updated_at                  timestamp NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE invoice_settings;`);
  }
}
