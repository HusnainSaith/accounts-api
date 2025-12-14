import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRolePermissions1762602628826 implements MigrationInterface {
  name = 'CreateRolePermissions1762602628826';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE role_permissions (
        id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        role_id       uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE role_permissions;`);
  }
}
