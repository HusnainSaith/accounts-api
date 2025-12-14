import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVatReports1762602620271 implements MigrationInterface {
  name = 'CreateVatReports1762602620271';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE vat_report_status_enum AS ENUM ('draft', 'submitted', 'approved');
    `);

    await queryRunner.query(`
      CREATE TABLE vat_reports (
        id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id              uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        report_period_start     date NOT NULL,
        report_period_end       date NOT NULL,
        total_sales             numeric(18,2) NOT NULL,
        total_vat_collected     numeric(18,2) NOT NULL,
        total_purchases         numeric(18,2) NOT NULL,
        total_vat_paid          numeric(18,2) NOT NULL,
        net_vat_payable         numeric(18,2) NOT NULL,
        report_status           vat_report_status_enum NOT NULL DEFAULT 'draft',
        generated_at            timestamp NOT NULL DEFAULT now(),
        submitted_at            timestamp
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE vat_reports;`);
    await queryRunner.query(`DROP TYPE vat_report_status_enum;`);
  }
}
