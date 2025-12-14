import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitializeCompleteDatabase1762602700000 implements MigrationInterface {
  name = 'InitializeCompleteDatabase1762602700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create enums
    await queryRunner.query(`CREATE TYPE user_status_enum AS ENUM ('active', 'inactive', 'suspended')`);
    await queryRunner.query(`CREATE TYPE customer_type_enum AS ENUM ('individual', 'business')`);
    await queryRunner.query(`CREATE TYPE invoice_status_enum AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled')`);
    await queryRunner.query(`CREATE TYPE invoice_type_enum AS ENUM ('full', 'simplified')`);
    await queryRunner.query(`CREATE TYPE payment_method_enum AS ENUM ('cash', 'bank_transfer', 'credit_card', 'cheque')`);
    await queryRunner.query(`CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'cancelled')`);

    // Create roles table
    await queryRunner.query(`
      CREATE TABLE roles (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name                varchar(100) NOT NULL UNIQUE,
        description         text,
        is_system_role      boolean NOT NULL DEFAULT false,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create permissions table
    await queryRunner.query(`
      CREATE TABLE permissions (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name                varchar(100) NOT NULL UNIQUE,
        description         text,
        resource            varchar(100) NOT NULL,
        action              varchar(50) NOT NULL,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create countries table
    await queryRunner.query(`
      CREATE TABLE countries (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code                varchar(3) NOT NULL UNIQUE,
        name_en             varchar(255) NOT NULL,
        name_ar             varchar(255),
        currency_code       varchar(3) NOT NULL,
        vat_rate            numeric(5,2) DEFAULT 0.00,
        is_supported        boolean NOT NULL DEFAULT false,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create companies table
    await queryRunner.query(`
      CREATE TABLE companies (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name                varchar(255) NOT NULL,
        name_ar             varchar(255),
        trn                 varchar(64) NOT NULL UNIQUE,
        email               varchar(255),
        phone               varchar(50),
        address             text,
        city                varchar(255),
        country_code        varchar(3) NOT NULL REFERENCES countries(code),
        logo_url            varchar(500),
        logo_s3_key         varchar(500),
        is_active           boolean NOT NULL DEFAULT true,
        is_vat_registered   boolean DEFAULT false,
        default_vat_rate    numeric(5,2) DEFAULT 5.00,
        settings            jsonb DEFAULT '{}'::jsonb,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE users (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        role_id             uuid NOT NULL REFERENCES roles(id),
        first_name          varchar(100) NOT NULL,
        last_name           varchar(100) NOT NULL,
        email               varchar(255) NOT NULL UNIQUE,
        password_hash       varchar(255) NOT NULL,
        phone               varchar(50),
        status              user_status_enum NOT NULL DEFAULT 'active',
        last_login_at       timestamp,
        email_verified_at   timestamp,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create customers table
    await queryRunner.query(`
      CREATE TABLE customers (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        customer_type       customer_type_enum NOT NULL,
        name                varchar(255) NOT NULL,
        name_ar             varchar(255),
        email               varchar(255),
        phone               varchar(50),
        trn                 varchar(64),
        address             text,
        address_en          text,
        address_ar          text,
        city                varchar(255),
        country_code        varchar(3),
        default_currency    varchar(3),
        is_vat_registered   boolean NOT NULL DEFAULT false,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create items table
    await queryRunner.query(`
      CREATE TABLE items (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        item_code           varchar(100) NOT NULL,
        name                varchar(255) NOT NULL,
        name_ar             varchar(255),
        description         text,
        description_ar      text,
        unit_price          numeric(15,2) NOT NULL,
        currency_code       varchar(3) NOT NULL DEFAULT 'AED',
        default_vat_rate    numeric(5,2) NOT NULL DEFAULT 5.00,
        is_service          boolean NOT NULL DEFAULT false,
        is_active           boolean NOT NULL DEFAULT true,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now(),
        UNIQUE(company_id, item_code)
      )
    `);

    // Create invoices table
    await queryRunner.query(`
      CREATE TABLE invoices (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        customer_id         uuid NOT NULL REFERENCES customers(id),
        invoice_number      varchar(100) NOT NULL,
        invoice_type        invoice_type_enum NOT NULL DEFAULT 'full',
        status              invoice_status_enum NOT NULL DEFAULT 'draft',
        issue_date          date NOT NULL DEFAULT CURRENT_DATE,
        due_date            date,
        subtotal            numeric(15,2) NOT NULL DEFAULT 0.00,
        vat_amount          numeric(15,2) NOT NULL DEFAULT 0.00,
        total_amount        numeric(15,2) NOT NULL DEFAULT 0.00,
        currency_code       varchar(3) NOT NULL DEFAULT 'AED',
        notes               text,
        terms_conditions    text,
        seller_trn          varchar(64),
        buyer_trn           varchar(64),
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now(),
        UNIQUE(company_id, invoice_number)
      )
    `);

    // Create invoice_items table
    await queryRunner.query(`
      CREATE TABLE invoice_items (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id          uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        item_id             uuid REFERENCES items(id),
        description         varchar(500) NOT NULL,
        quantity            numeric(10,2) NOT NULL,
        unit_price          numeric(15,2) NOT NULL,
        vat_rate            numeric(5,2) NOT NULL DEFAULT 5.00,
        line_total          numeric(15,2) NOT NULL,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create expense_categories table
    await queryRunner.query(`
      CREATE TABLE expense_categories (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        name_en             varchar(255) NOT NULL,
        name_ar             varchar(255),
        code                varchar(50) NOT NULL,
        description         text,
        is_active           boolean NOT NULL DEFAULT true,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now(),
        UNIQUE(company_id, code)
      )
    `);

    // Create expenses table
    await queryRunner.query(`
      CREATE TABLE expenses (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        category_id         uuid NOT NULL REFERENCES expense_categories(id),
        vendor_en           varchar(255) NOT NULL,
        vendor_ar           varchar(255),
        amount              numeric(15,2) NOT NULL,
        currency            varchar(3) NOT NULL DEFAULT 'AED',
        expense_date        date NOT NULL DEFAULT CURRENT_DATE,
        description         text,
        receipt_url         varchar(500),
        taxable             boolean NOT NULL DEFAULT true,
        vat_rate            numeric(5,2) DEFAULT 5.00,
        vat_amount          numeric(15,2) DEFAULT 0.00,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create additional tables
    await queryRunner.query(`
      CREATE TABLE vat_reports (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        period_start        date NOT NULL,
        period_end          date NOT NULL,
        total_sales         numeric(15,2) DEFAULT 0.00,
        total_vat_collected numeric(15,2) DEFAULT 0.00,
        total_purchases     numeric(15,2) DEFAULT 0.00,
        total_vat_paid      numeric(15,2) DEFAULT 0.00,
        net_vat_due         numeric(15,2) DEFAULT 0.00,
        status              varchar(50) DEFAULT 'draft',
        submitted_at        timestamp,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS vat_reports CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS expenses CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS expense_categories CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS invoice_items CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS invoices CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS items CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS customers CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS companies CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS countries CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS role_permissions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS permissions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS roles CASCADE`);
    
    await queryRunner.query(`DROP TYPE IF EXISTS payment_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_method_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS invoice_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS invoice_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS customer_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_status_enum`);
    
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}