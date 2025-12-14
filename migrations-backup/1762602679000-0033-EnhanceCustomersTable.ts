import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceCustomersTable1762602679000 implements MigrationInterface {
  name = 'EnhanceCustomersTable1762602679000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add bilingual fields
    await queryRunner.query(`
      ALTER TABLE customers
      ADD COLUMN name_ar varchar(255);
    `);

    await queryRunner.query(`
      ALTER TABLE customers
      ADD COLUMN address_ar text;
    `);

    // Update address column naming for clarity
    await queryRunner.query(`
      ALTER TABLE customers
      ADD COLUMN address_en text;
    `);

    // Migrate existing address to address_en if not null
    await queryRunner.query(`
      UPDATE customers
      SET address_en = address
      WHERE address IS NOT NULL AND address_en IS NULL;
    `);

    // Drop old address column
    await queryRunner.query(`
      ALTER TABLE customers
      DROP COLUMN IF EXISTS address;
    `);

    // Add default_currency field
    await queryRunner.query(`
      ALTER TABLE customers
      ADD COLUMN default_currency varchar(3);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE customers DROP COLUMN IF EXISTS name_ar;`,
    );
    await queryRunner.query(
      `ALTER TABLE customers DROP COLUMN IF EXISTS address_ar;`,
    );
    await queryRunner.query(
      `ALTER TABLE customers DROP COLUMN IF EXISTS address_en;`,
    );
    await queryRunner.query(
      `ALTER TABLE customers DROP COLUMN IF EXISTS default_currency;`,
    );
  }
}
