import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateItemTemplates1762602619259 implements MigrationInterface {
  name = 'CreateItemTemplates1762602619259';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE item_templates (
        id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        industry                varchar(255),
        item_name               varchar(255) NOT NULL,
        description             text,
        suggested_category      varchar(255),
        usage_count             integer NOT NULL DEFAULT 0
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE item_templates;`);
  }
}
