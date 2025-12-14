import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSequencingFunction1762602676000
  implements MigrationInterface
{
  name = 'CreateSequencingFunction1762602676000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the atomic sequence increment function
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION next_company_sequence(p_company_id uuid, p_name text)
      RETURNS bigint LANGUAGE plpgsql AS $$
      DECLARE
        v bigint;
      BEGIN
        LOOP
          UPDATE company_counters
          SET last_value = last_value + 1
          WHERE company_id = p_company_id AND name = p_name
          RETURNING last_value INTO v;

          IF FOUND THEN
            RETURN v;
          END IF;

          BEGIN
            INSERT INTO company_counters(company_id, name, last_value)
            VALUES (p_company_id, p_name, 1);
            RETURN 1;
          EXCEPTION WHEN unique_violation THEN
            -- concurrent insert, retry
          END;
        END LOOP;
      END;
      $$;
    `);

    // Create trigger function to auto-populate invoice_number on insert
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION invoices_before_insert()
      RETURNS trigger LANGUAGE plpgsql AS $$
      DECLARE
        seq bigint;
        prefix text;
        formatted text;
      BEGIN
        IF NEW.invoice_sequence IS NULL THEN
          seq := next_company_sequence(NEW.company_id, 'invoice');
          NEW.invoice_sequence := seq;
        END IF;

        -- choose prefix/format from company settings if present
        SELECT (settings->>'invoice_prefix') INTO prefix 
        FROM companies WHERE id = NEW.company_id;
        
        IF prefix IS NULL THEN
          prefix := substring(NEW.company_id::text, 1, 8);
        END IF;

        formatted := prefix || '-' || lpad(NEW.invoice_sequence::text, 6, '0');
        NEW.invoice_number := formatted;

        RETURN NEW;
      END;
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS invoices_before_insert();`,
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS next_company_sequence(uuid, text);`,
    );
  }
}
