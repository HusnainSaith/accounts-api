import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReportingViews1762602682000 implements MigrationInterface {
  name = 'CreateReportingViews1762602682000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add performance indexes for reporting
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_invoices_company_status 
      ON invoices(company_id, status);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_invoices_company_supply_date 
      ON invoices(company_id, supply_date DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_expenses_company_category 
      ON expenses(company_id, category_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_expenses_company_expense_date 
      ON expenses(company_id, expense_date DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice 
      ON invoice_items(invoice_id);
    `);

    // Create VAT Summary Materialized View
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW vat_summary AS
      SELECT
        i.company_id,
        date_trunc('month', i.supply_date) as period,
        SUM(i.subtotal) AS total_sales,
        SUM(i.vat_amount) AS total_vat_collected,
        COUNT(DISTINCT i.id) as invoice_count,
        SUM(i.total_amount) AS total_with_vat
      FROM invoices i
      WHERE i.status <> 'draft'
      GROUP BY i.company_id, date_trunc('month', i.supply_date);
    `);

    // Create an expense summary view
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW expense_summary AS
      SELECT
        e.company_id,
        e.category_id,
        ec.name_en as category_name_en,
        ec.name_ar as category_name_ar,
        date_trunc('month', e.expense_date) as period,
        SUM(e.amount) AS total_amount,
        SUM(e.vat_amount) AS total_vat,
        COUNT(DISTINCT e.id) as expense_count
      FROM expenses e
      LEFT JOIN expense_categories ec ON e.category_id = ec.id
      GROUP BY e.company_id, e.category_id, ec.name_en, ec.name_ar, date_trunc('month', e.expense_date);
    `);

    // Create index on materialized views for faster queries
    await queryRunner.query(`
      CREATE INDEX idx_vat_summary_company 
      ON vat_summary(company_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_expense_summary_company 
      ON expense_summary(company_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP MATERIALIZED VIEW IF EXISTS expense_summary;`,
    );
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS vat_summary;`);
    // Indexes are automatically dropped with views if they're dependent
  }
}
