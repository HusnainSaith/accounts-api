import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrnUniqueConstraint1762602650000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, update duplicate TRN values to make them unique
    await queryRunner.query(`
      UPDATE companies 
      SET trn = CONCAT(trn, '-', id::text)
      WHERE trn IN (
        SELECT trn 
        FROM companies 
        WHERE trn IS NOT NULL 
        GROUP BY trn 
        HAVING COUNT(*) > 1
      );
    `);

    // Now add the unique constraint
    await queryRunner.query(`
      ALTER TABLE companies 
      ADD CONSTRAINT uk_companies_trn UNIQUE (trn);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE companies 
      DROP CONSTRAINT IF EXISTS uk_companies_trn;
    `);
  }
}
