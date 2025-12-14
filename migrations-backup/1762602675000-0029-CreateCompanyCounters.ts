import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompanyCounters1762602675000 implements MigrationInterface {
  name = 'CreateCompanyCounters1762602675000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE company_counters (
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        name                varchar(100) NOT NULL,
        last_value          bigint NOT NULL DEFAULT 0,
        prefix              varchar(50),
        format              varchar(100),
        PRIMARY KEY (company_id, name)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_company_counters_company_id 
      ON company_counters(company_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE company_counters;`);
  }
}
