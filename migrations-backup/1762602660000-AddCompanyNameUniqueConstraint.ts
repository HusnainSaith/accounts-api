import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyNameUniqueConstraint1762602660000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, update duplicate company names to make them unique
    await queryRunner.query(`
      WITH duplicates AS (
        SELECT LOWER(name) as lower_name
        FROM companies 
        WHERE name IS NOT NULL 
        GROUP BY LOWER(name) 
        HAVING COUNT(*) > 1
      )
      UPDATE companies 
      SET name = CONCAT(name, '-', id::text)
      WHERE LOWER(name) IN (SELECT lower_name FROM duplicates);
    `);

    // Now add the unique constraint (case-insensitive)
    await queryRunner.query(`
      CREATE UNIQUE INDEX uk_companies_name 
      ON companies (LOWER(name));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS uk_companies_name;
    `);
  }
}
