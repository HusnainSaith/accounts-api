import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceCompaniesTable1762602678000 implements MigrationInterface {
  name = 'EnhanceCompaniesTable1762602678000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add bilingual name fields
    await queryRunner.query(`
      ALTER TABLE companies
      ADD COLUMN name_ar varchar(255);
    `);

    // Add VAT registration flag
    await queryRunner.query(`
      ALTER TABLE companies
      ADD COLUMN is_vat_registered boolean DEFAULT false;
    `);

    // Add logo_s3_key for S3 storage
    await queryRunner.query(`
      ALTER TABLE companies
      ADD COLUMN logo_s3_key varchar(500);
    `);

    // Update old logo_url to be logo_s3_key if needed (rename column)
    // First check if logo_url exists and migrate it
    await queryRunner.query(`
      ALTER TABLE companies
      DROP COLUMN IF EXISTS logo_url;
    `);

    // Add settings JSONB for storing company configuration
    await queryRunner.query(`
      ALTER TABLE companies
      ADD COLUMN settings jsonb DEFAULT '{}'::jsonb;
    `);

    // Add default_vat_rate column if not present
    await queryRunner.query(`
      ALTER TABLE companies
      ADD COLUMN default_vat_rate numeric(5,2) DEFAULT 5.00;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE companies DROP COLUMN IF EXISTS name_ar;`,
    );
    await queryRunner.query(
      `ALTER TABLE companies DROP COLUMN IF EXISTS is_vat_registered;`,
    );
    await queryRunner.query(
      `ALTER TABLE companies DROP COLUMN IF EXISTS logo_s3_key;`,
    );
    await queryRunner.query(
      `ALTER TABLE companies DROP COLUMN IF EXISTS settings;`,
    );
    await queryRunner.query(
      `ALTER TABLE companies DROP COLUMN IF EXISTS default_vat_rate;`,
    );
  }
}
