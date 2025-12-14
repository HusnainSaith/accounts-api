import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceSequenceField1762602677000
  implements MigrationInterface
{
  name = 'AddInvoiceSequenceField1762602677000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add invoice_sequence column to invoices table
    await queryRunner.query(`
      ALTER TABLE invoices
      ADD COLUMN invoice_sequence bigint;
    `);

    // Add bilingual fields to invoices
    await queryRunner.query(`
      ALTER TABLE invoices
      ADD COLUMN notes_ar text;
    `);

    // Add seller/buyer TRN fields
    await queryRunner.query(`
      ALTER TABLE invoices
      ADD COLUMN seller_trn varchar(64);
    `);

    await queryRunner.query(`
      ALTER TABLE invoices
      ADD COLUMN buyer_trn varchar(64);
    `);

    // Add vat_rate_used field
    await queryRunner.query(`
      ALTER TABLE invoices
      ADD COLUMN vat_rate_used numeric(5,2);
    `);

    // Add company_id to invoice_items if not already present (for RLS)
    await queryRunner.query(`
      ALTER TABLE invoice_items
      ADD COLUMN company_id uuid REFERENCES companies(id);
    `);

    // Add vat_tag for VAT categorization
    await queryRunner.query(`
      ALTER TABLE invoice_items
      ADD COLUMN vat_tag varchar(50);
    `);

    // Create trigger for auto-numbering
    await queryRunner.query(`
      CREATE TRIGGER trg_invoices_before_insert
      BEFORE INSERT ON invoices
      FOR EACH ROW
      EXECUTE FUNCTION invoices_before_insert();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS trg_invoices_before_insert ON invoices;`,
    );
    await queryRunner.query(
      `ALTER TABLE invoices DROP COLUMN IF EXISTS invoice_sequence;`,
    );
    await queryRunner.query(
      `ALTER TABLE invoices DROP COLUMN IF EXISTS notes_ar;`,
    );
    await queryRunner.query(
      `ALTER TABLE invoices DROP COLUMN IF EXISTS seller_trn;`,
    );
    await queryRunner.query(
      `ALTER TABLE invoices DROP COLUMN IF EXISTS buyer_trn;`,
    );
    await queryRunner.query(
      `ALTER TABLE invoices DROP COLUMN IF EXISTS vat_rate_used;`,
    );
    await queryRunner.query(
      `ALTER TABLE invoice_items DROP COLUMN IF EXISTS company_id;`,
    );
    await queryRunner.query(
      `ALTER TABLE invoice_items DROP COLUMN IF EXISTS vat_tag;`,
    );
  }
}
