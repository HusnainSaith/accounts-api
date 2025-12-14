import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class RLSService {
  constructor(private dataSource: DataSource) {}

  // Use the same session variable name as the migrations/policies: app.current_tenant
  async setCompanyContext(companyId: string): Promise<void> {
    await this.dataSource.query(
      `SELECT set_config('app.current_tenant', $1, true)`,
      [companyId],
    );
  }

  async clearCompanyContext(): Promise<void> {
    await this.dataSource.query(`SELECT set_config('app.current_tenant', '', true)`);
    await this.dataSource.query(`RESET app.current_tenant`);
  }

  async withCompanyContext<T>(
    companyId: string,
    callback: () => Promise<T>,
  ): Promise<T> {
    await this.setCompanyContext(companyId);
    try {
      return await callback();
    } finally {
      await this.clearCompanyContext();
    }
  }
}
