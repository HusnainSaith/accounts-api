import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePayments1762602674000 implements MigrationInterface {
  name = 'CreatePayments1762602674000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE payment_method_enum AS ENUM ('bank', 'cash', 'card', 'online', 'cheque');
    `);

    await queryRunner.query(`
      CREATE TABLE payments (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        invoice_id          uuid REFERENCES invoices(id) ON DELETE SET NULL,
        amount              numeric(18,4) NOT NULL,
        currency            varchar(3) NOT NULL,
        payment_method      payment_method_enum NOT NULL,
        payment_date        timestamp NOT NULL DEFAULT now(),
        reference_number    varchar(255),
        notes               text,
        created_by          uuid REFERENCES users(id),
        created_at          timestamp NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_payments_company_id 
      ON payments(company_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_payments_invoice_id 
      ON payments(invoice_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_payments_company_date 
      ON payments(company_id, payment_date);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE payments;`);
    await queryRunner.query(`DROP TYPE payment_method_enum;`);
  }
}
