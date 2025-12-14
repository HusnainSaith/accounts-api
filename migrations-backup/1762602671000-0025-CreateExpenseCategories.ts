import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateExpenseCategories1762602671000
  implements MigrationInterface
{
  name = 'CreateExpenseCategories1762602671000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE expense_categories (
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
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_expense_categories_company_id 
      ON expense_categories(company_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE expense_categories;`);
  }
}
