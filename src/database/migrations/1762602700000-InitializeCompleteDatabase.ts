import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitializeCompleteDatabase1762602700000
  implements MigrationInterface
{
  name = 'InitializeCompleteDatabase1762602700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create enums
    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE audit_action_enum AS ENUM ('create', 'update', 'delete', 'send', 'pay');
      EXCEPTION WHEN duplicate_object THEN null;
    END $$;`);
    
    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE backup_status_enum AS ENUM ('in_progress', 'completed', 'failed');
      EXCEPTION WHEN duplicate_object THEN null;
    END $$;`);
    
    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE backup_type_enum AS ENUM ('full', 'incremental', 'automated');
      EXCEPTION WHEN duplicate_object THEN null;
    END $$;`);
    
    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE customer_type_enum AS ENUM ('individual', 'business');
      EXCEPTION WHEN duplicate_object THEN null;
    END $$;`);
    
    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE invoice_status_enum AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
      EXCEPTION WHEN duplicate_object THEN null;
    END $$;`);
    
    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE invoice_type_enum AS ENUM ('full', 'simplified');
      EXCEPTION WHEN duplicate_object THEN null;
    END $$;`);
    
    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE payment_method_enum AS ENUM ('bank', 'cash', 'card', 'online', 'cheque');
      EXCEPTION WHEN duplicate_object THEN null;
    END $$;`);
    
    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE user_language_enum AS ENUM ('en', 'ar');
      EXCEPTION WHEN duplicate_object THEN null;
    END $$;`);
    
    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE user_role_enum AS ENUM ('owner', 'staff', 'accountant');
      EXCEPTION WHEN duplicate_object THEN null;
    END $$;`);
    
    await queryRunner.query(`DO $$ BEGIN
      CREATE TYPE vat_report_status_enum AS ENUM ('draft', 'submitted', 'approved');
      EXCEPTION WHEN duplicate_object THEN null;
    END $$;`);

    // Create roles table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        role_name           varchar(255) NOT NULL,
        description         text,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create permissions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        permission_name     varchar(255) NOT NULL,
        description         text
      )
    `);

    // Create companies table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name                varchar(255) NOT NULL,
        country_code        varchar(3) NOT NULL,
        currency_code       varchar(3) NOT NULL,
        vat_rate            numeric(5,2) NOT NULL,
        trn                 varchar(64),
        cr_number           varchar(100),
        address             text,
        phone               varchar(50),
        email               varchar(255),
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now(),
        is_active           boolean NOT NULL DEFAULT true,
        is_test_account     boolean NOT NULL DEFAULT false,
        name_ar             varchar(255),
        is_vat_registered   boolean DEFAULT false,
        logo_s3_key         varchar(500),
        settings            jsonb DEFAULT '{}'::jsonb,
        default_vat_rate    numeric(5,2) DEFAULT 5.00,
        logo_url            varchar(500)
      )
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        first_name          varchar(255) NOT NULL,
        last_name           varchar(255) NOT NULL,
        email               varchar(255) NOT NULL,
        password_hash       varchar(255) NOT NULL,
        role                user_role_enum NOT NULL,
        phone               varchar(50),
        preferred_language  user_language_enum NOT NULL DEFAULT 'en',
        is_active           boolean NOT NULL DEFAULT true,
        last_login          timestamp,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create customers table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        customer_type       customer_type_enum NOT NULL,
        name                varchar(255) NOT NULL,
        email               varchar(255),
        phone               varchar(50),
        trn                 varchar(64),
        city                varchar(255),
        country_code        varchar(3),
        is_vat_registered   boolean NOT NULL DEFAULT false,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now(),
        name_ar             varchar(255),
        address_ar          text,
        address_en          text,
        default_currency    varchar(3),
        address             text
      )
    `);

    // Create items table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS items (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        item_code           varchar(100),
        category            varchar(255),
        unit_price          numeric(18,4) NOT NULL,
        currency_code       varchar(3) NOT NULL,
        default_vat_rate    numeric(5,2),
        is_service          boolean NOT NULL DEFAULT true,
        is_active           boolean NOT NULL DEFAULT true,
        ai_suggested        boolean NOT NULL DEFAULT false,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now(),
        description_ar      text,
        description_en      text,
        name_ar             varchar(255),
        name_en             varchar(255) NOT NULL,
        vat_rate            numeric(5,2)
      )
    `);

    // Create invoices table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        customer_id         uuid NOT NULL REFERENCES customers(id),
        invoice_number      varchar(100) NOT NULL,
        invoice_type        invoice_type_enum NOT NULL,
        status              invoice_status_enum NOT NULL DEFAULT 'draft',
        due_date            date,
        supply_date         date,
        subtotal            numeric(18,2) NOT NULL,
        vat_rate            numeric(5,2) NOT NULL,
        vat_amount          numeric(18,2) NOT NULL,
        discount_amount     numeric(18,2) NOT NULL DEFAULT 0,
        total_amount        numeric(18,2) NOT NULL,
        currency_code       varchar(3) NOT NULL,
        exchange_rate_to_aed numeric(18,6),
        notes               text,
        payment_method      varchar(255),
        pdf_path            varchar(500),
        qr_code_data        text,
        created_by          uuid REFERENCES users(id),
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now(),
        paid_at             timestamp,
        invoice_sequence    bigint,
        notes_ar            text,
        seller_trn          varchar(64),
        buyer_trn           varchar(64),
        vat_rate_used       numeric(5,2)
      )
    `);

    // Create invoice_items table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id          uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        item_id             uuid REFERENCES items(id),
        description         text NOT NULL,
        quantity            numeric(18,4) NOT NULL,
        unit_price          numeric(18,4) NOT NULL,
        discount_percentage numeric(5,2) NOT NULL DEFAULT 0,
        vat_rate            numeric(5,2) NOT NULL,
        line_total          numeric(18,2) NOT NULL,
        line_vat_amount     numeric(18,2) NOT NULL,
        sort_order          integer NOT NULL,
        created_at          timestamp NOT NULL DEFAULT now(),
        company_id          uuid REFERENCES companies(id),
        vat_tag             varchar(50)
      )
    `);

    // Create expense_categories table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS expense_categories (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        code                varchar(50),
        name_en             varchar(255) NOT NULL,
        name_ar             varchar(255),
        description_en      text,
        description_ar      text,
        is_default          boolean NOT NULL DEFAULT false,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now()
      )
    `);

    // Create expenses table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        category_id         uuid NOT NULL REFERENCES expense_categories(id),
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
      )
    `);

    // Create remaining tables
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        role_id             uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id       uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS vat_reports (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        report_period_start date NOT NULL,
        report_period_end   date NOT NULL,
        total_sales         numeric(18,2) NOT NULL,
        total_vat_collected numeric(18,2) NOT NULL,
        total_purchases     numeric(18,2) NOT NULL,
        total_vat_paid      numeric(18,2) NOT NULL,
        net_vat_payable     numeric(18,2) NOT NULL,
        report_status       vat_report_status_enum NOT NULL DEFAULT 'draft',
        generated_at        timestamp NOT NULL DEFAULT now(),
        submitted_at        timestamp
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid REFERENCES companies(id),
        user_id             uuid REFERENCES users(id),
        entity_type         varchar(100) NOT NULL,
        entity_id           uuid NOT NULL,
        action              audit_action_enum NOT NULL,
        old_values          jsonb,
        new_values          jsonb NOT NULL,
        ip_address          varchar(100),
        user_agent          text,
        created_at          timestamp NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id             uuid NOT NULL REFERENCES users(id),
        token               varchar(255) NOT NULL,
        expires_at          timestamp NOT NULL,
        used_at             timestamp,
        created_at          timestamp NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS blacklisted_tokens (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        token_jti           varchar(255) NOT NULL,
        user_id             uuid NOT NULL REFERENCES users(id),
        expires_at          timestamp NOT NULL,
        created_at          timestamp NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS backup_logs (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid REFERENCES companies(id),
        backup_type         backup_type_enum NOT NULL,
        backup_location     varchar(500) NOT NULL,
        file_size_mb        numeric(18,2),
        status              backup_status_enum NOT NULL,
        initiated_by        uuid REFERENCES users(id),
        started_at          timestamp NOT NULL DEFAULT now(),
        completed_at        timestamp
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS company_counters (
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        name                varchar(100) NOT NULL,
        last_value          bigint NOT NULL DEFAULT 0,
        prefix              varchar(50),
        format              varchar(100),
        PRIMARY KEY (company_id, name)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS encryption_keys (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        key_name            varchar(255) NOT NULL,
        encrypted_key       text NOT NULL,
        key_version         integer NOT NULL DEFAULT 1,
        created_at          timestamp NOT NULL DEFAULT now(),
        rotated_at          timestamp,
        is_active           boolean NOT NULL DEFAULT true
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS invoice_settings (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        next_invoice_number integer NOT NULL,
        invoice_prefix      varchar(50) NOT NULL,
        invoice_number_format varchar(100) NOT NULL,
        default_payment_terms_days integer,
        default_notes       text,
        include_company_logo boolean NOT NULL DEFAULT true,
        auto_send_on_create boolean NOT NULL DEFAULT false,
        enable_qr_code      boolean NOT NULL DEFAULT false,
        updated_at          timestamp NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS item_templates (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        industry            varchar(255),
        item_name           varchar(255) NOT NULL,
        description         text,
        suggested_category  varchar(255),
        usage_count         integer NOT NULL DEFAULT 0
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS company_item_templates (
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        item_template_id    uuid NOT NULL REFERENCES item_templates(id) ON DELETE CASCADE,
        PRIMARY KEY (company_id, item_template_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ocr_extractions (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        receipt_s3_key      varchar(500) NOT NULL,
        extracted           jsonb,
        confidence          jsonb,
        source              varchar(50) NOT NULL DEFAULT 'tesseract',
        status              varchar(30) NOT NULL DEFAULT 'parsed',
        created_at          timestamp NOT NULL DEFAULT now(),
        processed_at        timestamp
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS onboarding_steps (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        step_number         integer NOT NULL,
        title               varchar(255) NOT NULL,
        description         text,
        action_label        varchar(255),
        action_url          varchar(500),
        icon                varchar(100),
        is_required         boolean NOT NULL DEFAULT false,
        sort_order          integer NOT NULL DEFAULT 0
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_onboarding_progress (
        user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        onboarding_step_id  uuid NOT NULL REFERENCES onboarding_steps(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, onboarding_step_id)
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        invoice_id          uuid REFERENCES invoices(id),
        amount              numeric(18,4) NOT NULL,
        currency            varchar(3) NOT NULL,
        payment_method      payment_method_enum NOT NULL,
        payment_date        timestamp NOT NULL DEFAULT now(),
        reference_number    varchar(255),
        notes               text,
        created_by          uuid REFERENCES users(id),
        created_at          timestamp NOT NULL DEFAULT now()
      )
    `);

    // Enable RLS on tenant-scoped tables
    const tables = [
      'companies',
      'users',
      'customers',
      'items',
      'invoices',
      'invoice_items',
      'expenses',
      'expense_categories',
      'vat_reports',
      'audit_logs',
    ];

    for (const table of tables) {
      await queryRunner.query(
        `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS blacklisted_tokens CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS password_resets CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS vat_reports CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS role_permissions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS expenses CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS expense_categories CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS invoice_items CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS invoices CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS items CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS customers CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS companies CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS permissions CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS roles CASCADE`);

    await queryRunner.query(`DROP TYPE IF EXISTS vat_report_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_language_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_method_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS invoice_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS invoice_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS customer_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS backup_type_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS backup_status_enum`);
    await queryRunner.query(`DROP TYPE IF EXISTS audit_action_enum`);

    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
