import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExpenses1762602672000 implements MigrationInterface {
  name = 'CreateExpenses1762602672000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE expenses (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        category_id         uuid NOT NULL REFERENCES expense_categories(id) ON DELETE RESTRICT,
        vendor_en           varchar(255) NOT NULL,
        vendor_ar           varchar(255),
        amount              numeric(18,4) NOT NULL,
        currency            varchar(3) NOT NULL,
        expense_date        date NOT NULL DEFAULT CURRENT_DATE,
        taxable             boolean NOT NULL DEFAULT false,
        vat_amount          numeric(18,4) NOT NULL DEFAULT 0,
        vat_rate            numeric(5,2),
        is_deductible       boolean NOT NULL DEFAULT true,
        receipt_s3_key      varchar(500),
        ocr_extraction      jsonb,
        ocr_language        varchar(10),
        notes_en            text,
        notes_ar            text,
        created_by          uuid REFERENCES users(id),
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_expenses_company_id 
      ON expenses(company_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_expenses_company_date 
      ON expenses(company_id, expense_date);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_expenses_category_id 
      ON expenses(category_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE expenses;`);
  }
}
