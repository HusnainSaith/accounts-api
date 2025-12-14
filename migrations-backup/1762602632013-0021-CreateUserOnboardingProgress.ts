import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserOnboardingProgress1762602632013
  implements MigrationInterface
{
  name = 'CreateUserOnboardingProgress1762602632013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE user_onboarding_progress (
        user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        onboarding_step_id uuid NOT NULL REFERENCES onboarding_steps(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, onboarding_step_id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE user_onboarding_progress;`);
  }
}
