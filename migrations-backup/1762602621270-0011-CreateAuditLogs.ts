import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLogs1762602621270 implements MigrationInterface {
  name = 'CreateAuditLogs1762602621270';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE audit_action_enum AS ENUM ('create', 'update', 'delete', 'send', 'pay');
    `);

    await queryRunner.query(`
      CREATE TABLE audit_logs (
        id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id  uuid REFERENCES companies(id) ON DELETE CASCADE,
        user_id     uuid REFERENCES users(id),
        entity_type varchar(100) NOT NULL,
        entity_id   uuid NOT NULL,
        action      audit_action_enum NOT NULL,
        old_values  jsonb,
        new_values  jsonb NOT NULL,
        ip_address  varchar(100),
        user_agent  text,
        created_at  timestamp NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE audit_logs;`);
    await queryRunner.query(`DROP TYPE audit_action_enum;`);
  }
}
