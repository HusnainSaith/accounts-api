import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAccountingAllInOne1700000000001 implements MigrationInterface {
  name = 'InitAccountingAllInOne1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ---------- Extensions ----------
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    // ---------- ENUMs ----------
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE account_type AS ENUM ('asset','liability','equity','income','expense');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE account_level AS ENUM ('1','2','3','4');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE voucher_nature AS ENUM (
          'payment','receipt','journal','contra',
          'sales','purchase','credit_note','debit_note','opening'
        );
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE entry_status AS ENUM ('draft','pending_approval','approved','posted','cancelled','reversed');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE invoice_type AS ENUM ('sales','purchase');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE invoice_status AS ENUM ('draft','issued','partially_paid','paid','overdue','cancelled');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);

    // ---------- Core Multi-Tenant ----------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        legal_name VARCHAR(255),
        registration_no VARCHAR(100),
        tax_registration_no VARCHAR(100),
        country_code VARCHAR(3) NOT NULL,
        currency_code VARCHAR(3) NOT NULL,
        fiscal_year_start_month INTEGER DEFAULT 1,
        address TEXT,
        phone VARCHAR(50),
        email VARCHAR(255),
        logo_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        settings JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        CONSTRAINT chk_fiscal_month CHECK (fiscal_year_start_month BETWEEN 1 AND 12)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_companies_active
      ON companies(is_active) WHERE deleted_at IS NULL;
    `);

    // ---------- Users ----------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);

    // ---------- RBAC ----------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES companies(id) ON DELETE CASCADE, -- NULL = system/global role
        code VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        is_system BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_role_code UNIQUE (company_id, code)
      );
    `);

    // ✅ Updated: permissions use "code"
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(120) NOT NULL UNIQUE, -- e.g. vouchers:post
        description TEXT
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS company_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_company_user UNIQUE (company_id, user_id)
      );
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_company_users_company ON company_users(company_id);`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_company_users_user ON company_users(user_id);`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (company_id, user_id, role_id)
      );
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_user_roles_company_user ON user_roles(company_id, user_id);`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        actor_user_id UUID REFERENCES users(id),
        action VARCHAR(120) NOT NULL,
        entity VARCHAR(60) NOT NULL,
        entity_id UUID,
        before JSONB,
        after JSONB,
        ip VARCHAR(64),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_company_time
      ON audit_logs(company_id, created_at DESC);
    `);

    // ---------- Fiscal Years ----------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS fiscal_years (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        year_name VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_closed BOOLEAN DEFAULT FALSE,
        closed_at TIMESTAMP,
        closed_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_date_range CHECK (end_date > start_date),
        CONSTRAINT uq_fiscal_year UNIQUE (company_id, year_name)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_fiscal_years_company
      ON fiscal_years(company_id, start_date);
    `);

    // ---------- Accounts ----------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        code VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type account_type NOT NULL,
        level account_level NOT NULL,
        parent_id UUID REFERENCES accounts(id) ON DELETE RESTRICT,
        is_posting BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        is_system BOOLEAN DEFAULT FALSE,
        opening_balance NUMERIC(18, 2) DEFAULT 0,
        opening_balance_type VARCHAR(6) CHECK (opening_balance_type IN ('debit','credit')),
        currency_code VARCHAR(3),
        allow_reconciliation BOOLEAN DEFAULT FALSE,
        tax_category_id UUID,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        CONSTRAINT uq_account_code UNIQUE (company_id, code),
        CONSTRAINT chk_posting_level CHECK (
          (level = '4' AND is_posting = TRUE) OR
          (level IN ('1','2','3') AND is_posting = FALSE)
        )
      );
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_accounts_company ON accounts(company_id);`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(company_id, type);`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_accounts_parent ON accounts(parent_id);`,
    );
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_accounts_posting
      ON accounts(company_id, is_posting) WHERE is_posting = TRUE;
    `);

    // ---------- Voucher Types ----------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS voucher_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        code VARCHAR(10) NOT NULL,
        name VARCHAR(100) NOT NULL,
        nature voucher_nature NOT NULL,
        auto_numbering BOOLEAN DEFAULT TRUE,
        prefix VARCHAR(20),
        next_sequence BIGINT DEFAULT 1,
        reset_frequency VARCHAR(20) DEFAULT 'yearly',
        requires_approval BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_voucher_type UNIQUE (company_id, code)
      );
    `);

    // ---------- constant (Customers & Suppliers Combined) ----------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS constant (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        code VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('customer', 'supplier', 'both')),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        tax_registration_no VARCHAR(100),
        credit_limit NUMERIC(18, 2) DEFAULT 0,
        payment_terms INTEGER DEFAULT 30,
        account_id UUID REFERENCES accounts(id),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_constant_code UNIQUE (company_id, code)
      );
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_constant_company ON constant(company_id);`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_constant_type ON constant(company_id, type);`,
    );

    // ---------- Journal Entries ----------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        fiscal_year_id UUID NOT NULL REFERENCES fiscal_years(id),
        voucher_type_id UUID NOT NULL REFERENCES voucher_types(id),
        voucher_no VARCHAR(50) NOT NULL,
        entry_date DATE NOT NULL,
        posting_date DATE NOT NULL,
        reference VARCHAR(100),
        description TEXT,
        source_module VARCHAR(50),
        status entry_status DEFAULT 'draft',
        posted BOOLEAN DEFAULT FALSE,
        posted_at TIMESTAMP,
        posted_by UUID REFERENCES users(id),
        approved_by UUID REFERENCES users(id),
        approved_at TIMESTAMP,
        reversed_by_id UUID REFERENCES journal_entries(id),
        reversal_of_id UUID REFERENCES journal_entries(id),
        attachment_urls TEXT[],
        notes TEXT,
        created_by UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_voucher_no UNIQUE (company_id, voucher_no),
        CONSTRAINT chk_posted CHECK ((posted = TRUE AND posted_at IS NOT NULL) OR (posted = FALSE))
      );
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_journal_company_date ON journal_entries(company_id, entry_date);`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_journal_status ON journal_entries(company_id, status);`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_journal_voucher_type ON journal_entries(voucher_type_id);`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_journal_fiscal_year ON journal_entries(fiscal_year_id);`,
    );

    // ---------- Journal Entry Lines (UPDATED: party_id -> constant) ----------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS journal_entry_lines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
        line_no INTEGER NOT NULL,
        account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
        debit NUMERIC(18, 2) DEFAULT 0 CHECK (debit >= 0),
        credit NUMERIC(18, 2) DEFAULT 0 CHECK (credit >= 0),
        description TEXT,
        party_id UUID REFERENCES constant(id), -- ✅ replaces customer_id/supplier_id
        tax_amount NUMERIC(18, 2) DEFAULT 0,
        tax_category_id UUID,
        cost_center_id UUID,
        project_id UUID,
        reconciliation_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_debit_credit CHECK (
          (debit > 0 AND credit = 0) OR
          (credit > 0 AND debit = 0) OR
          (debit = 0 AND credit = 0)
        ),
        CONSTRAINT uq_line_no UNIQUE (journal_entry_id, line_no)
      );
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_journal_lines_entry ON journal_entry_lines(journal_entry_id);`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON journal_entry_lines(account_id);`,
    );

    // ---------- Invoices (UPDATED: party_id -> constant) ----------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        invoice_type invoice_type NOT NULL,
        invoice_no VARCHAR(50) NOT NULL,
        invoice_date DATE NOT NULL,
        due_date DATE NOT NULL,
        party_id UUID NOT NULL REFERENCES constant(id), -- ✅ replaces customer_id/supplier_id
        currency_code VARCHAR(3) NOT NULL,
        exchange_rate NUMERIC(18, 6) DEFAULT 1,
        subtotal NUMERIC(18, 2) NOT NULL,
        discount_amount NUMERIC(18, 2) DEFAULT 0,
        tax_amount NUMERIC(18, 2) DEFAULT 0,
        total_amount NUMERIC(18, 2) NOT NULL,
        paid_amount NUMERIC(18, 2) DEFAULT 0,
        balance_amount NUMERIC(18, 2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
        status invoice_status DEFAULT 'draft',
        voucher_id UUID REFERENCES journal_entries(id),
        payment_terms TEXT,
        notes TEXT,
        terms_conditions TEXT,
        created_by UUID NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_invoice_no UNIQUE (company_id, invoice_no)
      );
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id, invoice_date);`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_invoices_party ON invoices(party_id);`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(company_id, status);`,
    );

    // ---------- Invoice Lines ----------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS invoice_lines (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        line_no INTEGER NOT NULL,
        item_id UUID,
        description TEXT NOT NULL,
        quantity NUMERIC(18, 4) DEFAULT 1,
        unit_price NUMERIC(18, 2) NOT NULL,
        discount_percent NUMERIC(5, 2) DEFAULT 0,
        discount_amount NUMERIC(18, 2) DEFAULT 0,
        tax_percent NUMERIC(5, 2) DEFAULT 0,
        tax_amount NUMERIC(18, 2) DEFAULT 0,
        line_total NUMERIC(18, 2) NOT NULL,
        account_id UUID REFERENCES accounts(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_invoice_line UNIQUE (invoice_id, line_no)
      );
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice ON invoice_lines(invoice_id);`,
    );

    // ---------- Account Balances ----------
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS account_balances (
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        fiscal_year_id UUID NOT NULL REFERENCES fiscal_years(id),
        period DATE NOT NULL,
        opening_debit NUMERIC(18, 2) DEFAULT 0,
        opening_credit NUMERIC(18, 2) DEFAULT 0,
        period_debit NUMERIC(18, 2) DEFAULT 0,
        period_credit NUMERIC(18, 2) DEFAULT 0,
        closing_debit NUMERIC(18, 2) DEFAULT 0,
        closing_credit NUMERIC(18, 2) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (company_id, account_id, period)
      );
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_balances_account ON account_balances(account_id, period);`,
    );

    // ---------- Row Level Security (RLS) ----------
    // NOTE: app must set: set_config('app.company_id', '<uuid>', true)

    // Enable RLS
    await queryRunner.query(`ALTER TABLE companies ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(`ALTER TABLE roles ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(
      `ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;`,
    );
    await queryRunner.query(
      `ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;`,
    );
    await queryRunner.query(
      `ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;`,
    );
    await queryRunner.query(
      `ALTER TABLE fiscal_years ENABLE ROW LEVEL SECURITY;`,
    );
    await queryRunner.query(`ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(
      `ALTER TABLE voucher_types ENABLE ROW LEVEL SECURITY;`,
    );
    await queryRunner.query(`ALTER TABLE constant ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(
      `ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;`,
    );
    await queryRunner.query(
      `ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;`,
    );
    await queryRunner.query(`ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;`);
    await queryRunner.query(
      `ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;`,
    );
    await queryRunner.query(
      `ALTER TABLE account_balances ENABLE ROW LEVEL SECURITY;`,
    );

    // Drop old policy names safely (idempotent)
    const policyTables = [
      'companies',
      'roles',
      'company_users',
      'user_roles',
      'audit_logs',
      'fiscal_years',
      'accounts',
      'voucher_types',
      'constant',
      'journal_entries',
      'journal_entry_lines',
      'invoices',
      'invoice_lines',
      'account_balances',
    ];

    for (const t of policyTables) {
      await queryRunner.query(
        `DROP POLICY IF EXISTS tenant_isolation_policy ON ${t};`,
      );
    }

    // Companies: only current company row
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON companies
      FOR ALL TO PUBLIC
      USING (id = current_setting('app.company_id', true)::uuid);
    `);

    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON roles
      FOR ALL TO PUBLIC
      USING (company_id = current_setting('app.company_id', true)::uuid OR company_id IS NULL);
    `);

    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON company_users
      FOR ALL TO PUBLIC
      USING (company_id = current_setting('app.company_id', true)::uuid);
    `);

    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON user_roles
      FOR ALL TO PUBLIC
      USING (company_id = current_setting('app.company_id', true)::uuid);
    `);

    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON audit_logs
      FOR ALL TO PUBLIC
      USING (company_id = current_setting('app.company_id', true)::uuid);
    `);

    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON fiscal_years
      FOR ALL TO PUBLIC
      USING (company_id = current_setting('app.company_id', true)::uuid);
    `);

    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON accounts
      FOR ALL TO PUBLIC
      USING (company_id = current_setting('app.company_id', true)::uuid);
    `);

    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON voucher_types
      FOR ALL TO PUBLIC
      USING (company_id = current_setting('app.company_id', true)::uuid);
    `);

    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON constant
      FOR ALL TO PUBLIC
      USING (company_id = current_setting('app.company_id', true)::uuid);
    `);

    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON journal_entries
      FOR ALL TO PUBLIC
      USING (company_id = current_setting('app.company_id', true)::uuid);
    `);

    // Lines: use join to parent table for RLS
    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON journal_entry_lines
      FOR ALL TO PUBLIC
      USING (
        EXISTS (
          SELECT 1 FROM journal_entries je
          WHERE je.id = journal_entry_lines.journal_entry_id
            AND je.company_id = current_setting('app.company_id', true)::uuid
        )
      );
    `);

    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON invoices
      FOR ALL TO PUBLIC
      USING (company_id = current_setting('app.company_id', true)::uuid);
    `);

    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON invoice_lines
      FOR ALL TO PUBLIC
      USING (
        EXISTS (
          SELECT 1 FROM invoices i
          WHERE i.id = invoice_lines.invoice_id
            AND i.company_id = current_setting('app.company_id', true)::uuid
        )
      );
    `);

    await queryRunner.query(`
      CREATE POLICY tenant_isolation_policy ON account_balances
      FOR ALL TO PUBLIC
      USING (company_id = current_setting('app.company_id', true)::uuid);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse dependency order
    await queryRunner.query(`DROP INDEX IF EXISTS idx_balances_account;`);
    await queryRunner.query(`DROP TABLE IF EXISTS account_balances;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_invoice_lines_invoice;`);
    await queryRunner.query(`DROP TABLE IF EXISTS invoice_lines;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_invoices_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_invoices_party;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_invoices_company;`);
    await queryRunner.query(`DROP TABLE IF EXISTS invoices;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_journal_lines_account;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_journal_lines_entry;`);
    await queryRunner.query(`DROP TABLE IF EXISTS journal_entry_lines;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_journal_fiscal_year;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_journal_voucher_type;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_journal_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_journal_company_date;`);
    await queryRunner.query(`DROP TABLE IF EXISTS journal_entries;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_constant_type;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_constant_company;`);
    await queryRunner.query(`DROP TABLE IF EXISTS constant;`);

    await queryRunner.query(`DROP TABLE IF EXISTS voucher_types;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_accounts_posting;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_accounts_parent;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_accounts_type;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_accounts_company;`);
    await queryRunner.query(`DROP TABLE IF EXISTS accounts;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_fiscal_years_company;`);
    await queryRunner.query(`DROP TABLE IF EXISTS fiscal_years;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_company_time;`);
    await queryRunner.query(`DROP TABLE IF EXISTS audit_logs;`);

    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_user_roles_company_user;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS user_roles;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_company_users_user;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_company_users_company;`);
    await queryRunner.query(`DROP TABLE IF EXISTS company_users;`);

    await queryRunner.query(`DROP TABLE IF EXISTS role_permissions;`);
    await queryRunner.query(`DROP TABLE IF EXISTS permissions;`);
    await queryRunner.query(`DROP TABLE IF EXISTS roles;`);

    await queryRunner.query(`DROP TABLE IF EXISTS users;`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_companies_active;`);
    await queryRunner.query(`DROP TABLE IF EXISTS companies;`);

    // Drop ENUMs
    await queryRunner.query(`DROP TYPE IF EXISTS invoice_status;`);
    await queryRunner.query(`DROP TYPE IF EXISTS invoice_type;`);
    await queryRunner.query(`DROP TYPE IF EXISTS entry_status;`);
    await queryRunner.query(`DROP TYPE IF EXISTS voucher_nature;`);
    await queryRunner.query(`DROP TYPE IF EXISTS account_level;`);
    await queryRunner.query(`DROP TYPE IF EXISTS account_type;`);

    // Extension
    await queryRunner.query(`DROP EXTENSION IF EXISTS pgcrypto;`);
  }
}
