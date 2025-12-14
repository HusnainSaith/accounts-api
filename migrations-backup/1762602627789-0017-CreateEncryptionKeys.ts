import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEncryptionKeys1762602627789 implements MigrationInterface {
  name = 'CreateEncryptionKeys1762602627789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE encryption_keys (
        id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id    uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        key_name      varchar(255) NOT NULL,
        encrypted_key text NOT NULL,
        key_version   integer NOT NULL DEFAULT 1,
        created_at    timestamp NOT NULL DEFAULT now(),
        rotated_at    timestamp,
        is_active     boolean NOT NULL DEFAULT true
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE encryption_keys;`);
  }
}
