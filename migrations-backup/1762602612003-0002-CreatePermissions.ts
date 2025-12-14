import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePermissions1762602612003 implements MigrationInterface {
  name = 'CreatePermissions1762602612003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE permissions (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        permission_name     varchar(255) NOT NULL,
        description         text
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE permissions;`);
  }
}
