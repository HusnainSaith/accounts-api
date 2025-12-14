import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBackupLogs1762602626375 implements MigrationInterface {
  name = 'CreateBackupLogs1762602626375';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE backup_type_enum AS ENUM ('full', 'incremental', 'automated');`,
    );
    await queryRunner.query(
      `CREATE TYPE backup_status_enum AS ENUM ('in_progress', 'completed', 'failed');`,
    );

    await queryRunner.query(`
      CREATE TABLE backup_logs (
        id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id      uuid REFERENCES companies(id) ON DELETE SET NULL,
        backup_type     backup_type_enum NOT NULL,
        backup_location varchar(500) NOT NULL,
        file_size_mb    numeric(18,2),
        status          backup_status_enum NOT NULL,
        initiated_by    uuid REFERENCES users(id),
        started_at      timestamp NOT NULL DEFAULT now(),
        completed_at    timestamp
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE backup_logs;`);
    await queryRunner.query(`DROP TYPE backup_status_enum;`);
    await queryRunner.query(`DROP TYPE backup_type_enum;`);
  }
}
