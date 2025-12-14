import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomerAddressColumn1762602684000 implements MigrationInterface {
  name = 'AddCustomerAddressColumn1762602684000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS address text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE customers 
      DROP COLUMN IF EXISTS address
    `);
  }
}