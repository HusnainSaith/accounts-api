import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnableRowLevelSecurity1762602635000 implements MigrationInterface {
  name = 'EnableRowLevelSecurity1762602635000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable RLS on tables with company_id
    await queryRunner.query(`ALTER TABLE companies ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE customers ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE items ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(
      `ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;`,
    );

    // Create RLS policies for companies table
    await queryRunner.query(`
      CREATE POLICY company_isolation ON companies
      FOR ALL
      USING (id = current_setting('app.current_company_id')::uuid);
    `);

    // Create RLS policies for customers table
    await queryRunner.query(`
      CREATE POLICY customer_company_isolation ON customers
      FOR ALL
      USING (company_id = current_setting('app.current_company_id')::uuid);
    `);

    // Create RLS policies for items table
    await queryRunner.query(`
      CREATE POLICY item_company_isolation ON items
      FOR ALL
      USING (company_id = current_setting('app.current_company_id')::uuid);
    `);

    // Create RLS policies for invoices table
    await queryRunner.query(`
      CREATE POLICY invoice_company_isolation ON invoices
      FOR ALL
      USING (company_id = current_setting('app.current_company_id')::uuid);
    `);

    // Create RLS policies for invoice_items table (through invoice)
    await queryRunner.query(`
      CREATE POLICY invoice_item_company_isolation ON invoice_items
      FOR ALL
      USING (
        invoice_id IN (
          SELECT id FROM invoices 
          WHERE company_id = current_setting('app.current_company_id')::uuid
        )
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop policies
    await queryRunner.query(
      `DROP POLICY IF EXISTS company_isolation ON companies;`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS customer_company_isolation ON customers;`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS item_company_isolation ON items;`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS invoice_company_isolation ON invoices;`,
    );
    await queryRunner.query(
      `DROP POLICY IF EXISTS invoice_item_company_isolation ON invoice_items;`,
    );

    // Disable RLS
    await queryRunner.query(
      `ALTER TABLE companies DISABLE ROW LEVEL SECURITY;`,
    );
    await queryRunner.query(
      `ALTER TABLE customers DISABLE ROW LEVEL SECURITY;`,
    );
    await queryRunner.query(`ALTER TABLE items DISABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(
      `ALTER TABLE invoice_items DISABLE ROW LEVEL SECURITY;`,
    );
  }
}
