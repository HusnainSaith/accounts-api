import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCountries1762602628827 implements MigrationInterface {
  name = 'CreateCountries1762602628827';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Country configs table removed - not needed
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No table to drop
  }
}