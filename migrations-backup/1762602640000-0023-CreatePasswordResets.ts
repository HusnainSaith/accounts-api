import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePasswordResets1762602640000 implements MigrationInterface {
  name = 'CreatePasswordResets1762602640000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE password_resets (
        id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token      varchar(255) NOT NULL,
        expires_at timestamp NOT NULL,
        used_at    timestamp,
        created_at timestamp NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_password_resets_token ON password_resets(token);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE password_resets;`);
  }
}
