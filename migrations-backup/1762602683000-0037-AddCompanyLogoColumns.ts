import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyLogoColumns1762602683000 implements MigrationInterface {
  name = 'AddCompanyLogoColumns1762602683000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS logo_url varchar(500)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE companies 
      DROP COLUMN IF EXISTS logo_url
    `);
  }
}