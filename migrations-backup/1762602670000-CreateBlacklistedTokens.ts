import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBlacklistedTokens1762602670000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE blacklisted_tokens (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        token_jti varchar(255) NOT NULL,
        user_id uuid NOT NULL,
        expires_at timestamp NOT NULL,
        created_at timestamp NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE blacklisted_tokens;`);
  }
}
