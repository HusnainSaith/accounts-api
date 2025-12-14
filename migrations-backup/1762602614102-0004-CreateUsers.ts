import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1762602614102 implements MigrationInterface {
  name = 'CreateUsers1762602614102';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE user_role_enum AS ENUM ('owner', 'staff', 'accountant');
      CREATE TYPE user_language_enum AS ENUM ('en', 'ar');
    `);

    await queryRunner.query(`
      CREATE TABLE users (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        first_name          varchar(255) NOT NULL,
        last_name           varchar(255) NOT NULL,
        email               varchar(255) UNIQUE NOT NULL,
        password_hash       varchar(255) NOT NULL,
        role                user_role_enum NOT NULL,
        role_id             uuid REFERENCES roles(id),
        phone               varchar(50),
        preferred_language  user_language_enum NOT NULL DEFAULT 'en',
        is_active           boolean NOT NULL DEFAULT true,
        last_login          timestamp,
        created_at          timestamp NOT NULL DEFAULT now(),
        updated_at          timestamp NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE users;`);
    await queryRunner.query(`DROP TYPE user_language_enum;`);
    await queryRunner.query(`DROP TYPE user_role_enum;`);
  }
}
