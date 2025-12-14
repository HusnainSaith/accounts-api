import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFaqItems1762602624320 implements MigrationInterface {
  name = 'CreateFaqItems1762602624320';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // FAQ items table removed - not needed
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No table to drop
  }
}
