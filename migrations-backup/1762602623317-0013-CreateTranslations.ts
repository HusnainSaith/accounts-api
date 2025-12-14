import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTranslations1762602623317 implements MigrationInterface {
  name = 'CreateTranslations1762602623317';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Translations table removed - not needed
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No table to drop
  }
}
