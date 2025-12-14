import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropCustomerSupplierTables1700000000002 implements MigrationInterface {
  name = 'DropCustomerSupplierTables1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the old customers and suppliers tables
    // The constant table already exists from the previous migration
    await queryRunner.query(`DROP TABLE IF EXISTS customers CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS suppliers CASCADE;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate customers table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        code VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        tax_registration_no VARCHAR(100),
        credit_limit NUMERIC(18, 2) DEFAULT 0,
        payment_terms INTEGER DEFAULT 30,
        account_id UUID REFERENCES accounts(id),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        customer_type VARCHAR(20),
        name_ar VARCHAR(255),
        trn VARCHAR(64),
        address_en TEXT,
        address_ar TEXT,
        default_currency VARCHAR(3),
        city VARCHAR(255),
        country_code VARCHAR(3),
        is_vat_registered BOOLEAN DEFAULT FALSE,
        CONSTRAINT uq_customer_code UNIQUE (company_id, code)
      );
    `);

    // Recreate suppliers table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        code VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        tax_registration_no VARCHAR(100),
        payment_terms INTEGER DEFAULT 30,
        account_id UUID REFERENCES accounts(id),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_supplier_code UNIQUE (company_id, code)
      );
    `);

    // Enable RLS for the recreated tables
    await queryRunner.query(`ALTER TABLE customers ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;`);

    // Create RLS policies
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON customers
      FOR ALL TO PUBLIC
      USING (company_id = current_setting('app.company_id', true)::uuid);
    `);

    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON suppliers
      FOR ALL TO PUBLIC
      USING (company_id = current_setting('app.company_id', true)::uuid);
    `);
  }
}
