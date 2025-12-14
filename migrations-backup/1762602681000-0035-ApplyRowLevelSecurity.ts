import { MigrationInterface, QueryRunner } from 'typeorm';

export class ApplyRowLevelSecurity1762602681000 implements MigrationInterface {
  name = 'ApplyRowLevelSecurity1762602681000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable RLS on tenant-scoped tables
    const tables = [
      'companies',
      'users',
      'customers',
      'items',
      'invoices',
      'invoice_items',
      'payments',
      'expenses',
      'expense_categories',
      'ocr_extractions',
      'vat_reports',
      'audit_logs',
    ];

    for (const table of tables) {
      await queryRunner.query(
        `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`,
      );
    }

    // Create RLS policies for companies (allow access to own company)
    await queryRunner.query(`
      CREATE POLICY companies_tenant_isolation ON companies
        USING (id = (current_setting('app.current_tenant', true))::uuid)
        WITH CHECK (id = (current_setting('app.current_tenant', true))::uuid);
    `);

    // Policies for other tenant-scoped tables
    const tenantTables = [
      'customers',
      'items',
      'invoices',
      'payments',
      'expenses',
      'expense_categories',
      'ocr_extractions',
      'vat_reports',
    ];

    for (const table of tenantTables) {
      await queryRunner.query(`
        CREATE POLICY ${table}_tenant_isolation ON ${table}
          USING (company_id = (current_setting('app.current_tenant', true))::uuid)
          WITH CHECK (company_id = (current_setting('app.current_tenant', true))::uuid);
      `);
    }

    // Policy for invoice_items (check company_id denormalized field)
    await queryRunner.query(`
      CREATE POLICY invoice_items_tenant_isolation ON invoice_items
        USING (company_id = (current_setting('app.current_tenant', true))::uuid)
        WITH CHECK (company_id = (current_setting('app.current_tenant', true))::uuid);
    `);

    // Policy for users (company-scoped users)
    await queryRunner.query(`
      CREATE POLICY users_tenant_isolation ON users
        USING (company_id = (current_setting('app.current_tenant', true))::uuid)
        WITH CHECK (company_id = (current_setting('app.current_tenant', true))::uuid);
    `);

    // Policy for audit_logs (company_id may be null for system logs, but filter on company_id if present)
    await queryRunner.query(`
      CREATE POLICY audit_logs_tenant_isolation ON audit_logs
        USING (
          company_id IS NULL 
          OR company_id = (current_setting('app.current_tenant', true))::uuid
        )
        WITH CHECK (
          company_id IS NULL 
          OR company_id = (current_setting('app.current_tenant', true))::uuid
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'companies',
      'users',
      'customers',
      'items',
      'invoices',
      'invoice_items',
      'payments',
      'expenses',
      'expense_categories',
      'ocr_extractions',
      'vat_reports',
      'audit_logs',
    ];

    for (const table of tables) {
      await queryRunner.query(
        `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`,
      );
    }
  }
}
