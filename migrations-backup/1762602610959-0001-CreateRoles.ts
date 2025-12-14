import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoles1762602610959 implements MigrationInterface {
  name = 'CreateRoles1762602610959';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE roles (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        role_name       varchar(255) NOT NULL,
        description     text,
        created_at      timestamp NOT NULL DEFAULT now(),
        updated_at      timestamp NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE roles;`);
  }
}
