import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOcrExtractions1762602673000 implements MigrationInterface {
  name = 'CreateOcrExtractions1762602673000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE ocr_extractions (
        id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id          uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        receipt_s3_key      varchar(500) NOT NULL,
        extracted           jsonb,
        confidence          jsonb,
        source              varchar(50) NOT NULL DEFAULT 'tesseract',
        status              varchar(30) NOT NULL DEFAULT 'parsed',
        created_at          timestamp NOT NULL DEFAULT now(),
        processed_at        timestamp
      );
    `);

    await queryRunner.query(`
      CREATE INDEX idx_ocr_extractions_company_id 
      ON ocr_extractions(company_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_ocr_extractions_status 
      ON ocr_extractions(status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE ocr_extractions;`);
  }
}
