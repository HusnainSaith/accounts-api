import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceItemsTable1762602680000 implements MigrationInterface {
  name = 'EnhanceItemsTable1762602680000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add bilingual description fields
    await queryRunner.query(`
      ALTER TABLE items
      ADD COLUMN description_ar text;
    `);

    // Rename description to description_en and add description_ar
    await queryRunner.query(`
      ALTER TABLE items
      ADD COLUMN description_en text;
    `);

    // Migrate existing description to description_en
    await queryRunner.query(`
      UPDATE items
      SET description_en = description
      WHERE description IS NOT NULL AND description_en IS NULL;
    `);

    // Drop old description if it exists
    await queryRunner.query(`
      ALTER TABLE items
      DROP COLUMN IF EXISTS description;
    `);

    // Add bilingual name fields if not present
    await queryRunner.query(`
      ALTER TABLE items
      ADD COLUMN name_ar varchar(255);
    `);

    // Rename name to name_en
    await queryRunner.query(`
      ALTER TABLE items
      ADD COLUMN name_en varchar(255);
    `);

    // Migrate existing name to name_en
    await queryRunner.query(`
      UPDATE items
      SET name_en = name
      WHERE name IS NOT NULL AND name_en IS NULL;
    `);

    // Drop old name column
    await queryRunner.query(`
      ALTER TABLE items
      DROP COLUMN IF EXISTS name;
    `);

    // Ensure name_en is NOT NULL
    await queryRunner.query(`
      ALTER TABLE items
      ALTER COLUMN name_en SET NOT NULL;
    `);

    // Add vat_rate field for item-level VAT override
    await queryRunner.query(`
      ALTER TABLE items
      ADD COLUMN vat_rate numeric(5,2);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE items DROP COLUMN IF EXISTS description_ar;`,
    );
    await queryRunner.query(
      `ALTER TABLE items DROP COLUMN IF EXISTS description_en;`,
    );
    await queryRunner.query(`ALTER TABLE items DROP COLUMN IF EXISTS name_ar;`);
    await queryRunner.query(`ALTER TABLE items DROP COLUMN IF EXISTS name_en;`);
    await queryRunner.query(
      `ALTER TABLE items DROP COLUMN IF EXISTS vat_rate;`,
    );
  }
}
