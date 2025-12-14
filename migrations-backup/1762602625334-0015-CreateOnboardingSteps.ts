import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOnboardingSteps1762602625334 implements MigrationInterface {
  name = 'CreateOnboardingSteps1762602625334';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE onboarding_steps (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        step_number     integer NOT NULL,
        title           varchar(255) NOT NULL,
        description     text,
        action_label    varchar(255),
        action_url      varchar(500),
        icon            varchar(100),
        is_required     boolean NOT NULL DEFAULT false,
        sort_order      integer NOT NULL DEFAULT 0
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE onboarding_steps;`);
  }
}
