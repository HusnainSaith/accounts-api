import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompanyItemTemplates1762602630917
  implements MigrationInterface
{
  name = 'CreateCompanyItemTemplates1762602630917';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE company_item_templates (
        company_id       uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        item_template_id uuid NOT NULL REFERENCES item_templates(id) ON DELETE CASCADE,
        PRIMARY KEY (company_id, item_template_id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE company_item_templates;`);
  }
}
