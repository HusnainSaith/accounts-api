import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegisterDto } from '../dto/register.dto';

@Injectable()
export class RegistrationBootstrapService {
  constructor(private dataSource: DataSource) {}

  async bootstrapUserEnvironment(registerDto: RegisterDto, hashedPassword: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create User
      const userResult = await queryRunner.query(
        `INSERT INTO users (full_name, email, password_hash, is_active) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [`${registerDto.firstName} ${registerDto.lastName}`, registerDto.email, hashedPassword, true]
      );
      const userId = userResult[0].id;

      // 2. Create Default Company
      const countryConfig = this.getCountryConfig(registerDto.countryCode);
      const companyResult = await queryRunner.query(
        `INSERT INTO companies (name, country_code, currency_code, fiscal_year_start_month, phone, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
          registerDto.companyName || 'My Company',
          registerDto.countryCode,
          countryConfig.currencyCode,
          countryConfig.fiscalYearStartMonth,
          registerDto.phone,
          true
        ]
      );
      const companyId = companyResult[0].id;

      // 3. Link User to Company
      await queryRunner.query(
        `INSERT INTO company_users (company_id, user_id, is_active) VALUES ($1, $2, $3)`,
        [companyId, userId, true]
      );

      // 4. Create/Get Owner Role
      let ownerRoleId = await this.ensureOwnerRole(queryRunner, companyId);

      // 5. Assign Owner Role to User
      await queryRunner.query(
        `INSERT INTO user_roles (company_id, user_id, role_id) VALUES ($1, $2, $3)`,
        [companyId, userId, ownerRoleId]
      );

      // 6. Assign All Permissions to Owner Role
      await this.assignAllPermissionsToOwner(queryRunner, ownerRoleId);

      // 7. Create Default Chart of Accounts
      await this.createDefaultChartOfAccounts(queryRunner, companyId);

      // 8. Create Default Fiscal Year
      await this.createDefaultFiscalYear(queryRunner, companyId, countryConfig.fiscalYearStartMonth);

      await queryRunner.commitTransaction();

      return {
        userId,
        companyId,
        user: {
          id: userId,
          fullName: `${registerDto.firstName} ${registerDto.lastName}`,
          email: registerDto.email
        },
        company: {
          id: companyId,
          name: registerDto.companyName || 'My Company',
          countryCode: registerDto.countryCode,
          currencyCode: countryConfig.currencyCode
        }
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async ensureOwnerRole(queryRunner: any, companyId: string): Promise<string> {
    // Check if owner role exists for this company
    const existingRole = await queryRunner.query(
      `SELECT id FROM roles WHERE company_id = $1 AND code = 'owner'`,
      [companyId]
    );

    if (existingRole.length > 0) {
      return existingRole[0].id;
    }

    // Create owner role
    const roleResult = await queryRunner.query(
      `INSERT INTO roles (company_id, code, name, is_system) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [companyId, 'owner', 'Owner', true]
    );

    return roleResult[0].id;
  }

  private async assignAllPermissionsToOwner(queryRunner: any, ownerRoleId: string): Promise<void> {
    await queryRunner.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT $1, p.id FROM permissions p
       WHERE NOT EXISTS (
         SELECT 1 FROM role_permissions rp 
         WHERE rp.role_id = $1 AND rp.permission_id = p.id
       )`,
      [ownerRoleId]
    );
  }

  private async createDefaultChartOfAccounts(queryRunner: any, companyId: string): Promise<void> {
    const accounts = [
      // Level 1 - Major Groups
      { code: '1', name: 'Assets', type: 'asset', level: '1', parent: null, isPosting: false },
      { code: '2', name: 'Liabilities', type: 'liability', level: '1', parent: null, isPosting: false },
      { code: '3', name: 'Equity', type: 'equity', level: '1', parent: null, isPosting: false },
      { code: '4', name: 'Income', type: 'income', level: '1', parent: null, isPosting: false },
      { code: '5', name: 'Expenses', type: 'expense', level: '1', parent: null, isPosting: false },

      // Level 2 - Sub Groups
      { code: '11', name: 'Current Assets', type: 'asset', level: '2', parent: '1', isPosting: false },
      { code: '12', name: 'Fixed Assets', type: 'asset', level: '2', parent: '1', isPosting: false },
      { code: '21', name: 'Current Liabilities', type: 'liability', level: '2', parent: '2', isPosting: false },
      { code: '22', name: 'Long-Term Liabilities', type: 'liability', level: '2', parent: '2', isPosting: false },
      { code: '31', name: 'Capital', type: 'equity', level: '2', parent: '3', isPosting: false },
      { code: '41', name: 'Operating Income', type: 'income', level: '2', parent: '4', isPosting: false },
      { code: '51', name: 'Operating Expenses', type: 'expense', level: '2', parent: '5', isPosting: false },

      // Level 3 - Categories
      { code: '111', name: 'Cash & Bank', type: 'asset', level: '3', parent: '11', isPosting: false },
      { code: '112', name: 'Accounts Receivable', type: 'asset', level: '3', parent: '11', isPosting: false },
      { code: '211', name: 'Accounts Payable', type: 'liability', level: '3', parent: '21', isPosting: false },
      { code: '311', name: 'Owner Equity', type: 'equity', level: '3', parent: '31', isPosting: false },
      { code: '411', name: 'Sales Revenue', type: 'income', level: '3', parent: '41', isPosting: false },
      { code: '511', name: 'Cost of Sales', type: 'expense', level: '3', parent: '51', isPosting: false },

      // Level 4 - Posting Accounts
      { code: '1111', name: 'Cash in Hand', type: 'asset', level: '4', parent: '111', isPosting: true },
      { code: '1112', name: 'Bank Account', type: 'asset', level: '4', parent: '111', isPosting: true },
      { code: '1121', name: 'Trade Receivables', type: 'asset', level: '4', parent: '112', isPosting: true },
      { code: '2111', name: 'Trade Payables', type: 'liability', level: '4', parent: '211', isPosting: true },
      { code: '3111', name: 'Capital Account', type: 'equity', level: '4', parent: '311', isPosting: true },
      { code: '4111', name: 'Sales', type: 'income', level: '4', parent: '411', isPosting: true },
      { code: '5111', name: 'Purchases', type: 'expense', level: '4', parent: '511', isPosting: true }
    ];

    const accountMap = new Map();

    for (const account of accounts) {
      const parentId = account.parent ? accountMap.get(account.parent) : null;
      
      const result = await queryRunner.query(
        `INSERT INTO accounts (company_id, code, name, type, level, parent_id, is_posting, is_system, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [companyId, account.code, account.name, account.type, account.level, parentId, account.isPosting, true, true]
      );
      
      accountMap.set(account.code, result[0].id);
    }
  }

  private async createDefaultFiscalYear(queryRunner: any, companyId: string, fiscalStartMonth: number): Promise<void> {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Determine fiscal year based on start month
    let fiscalYear = currentYear;
    if (currentDate.getMonth() + 1 < fiscalStartMonth) {
      fiscalYear = currentYear - 1;
    }

    const startDate = new Date(fiscalYear, fiscalStartMonth - 1, 1);
    const endDate = new Date(fiscalYear + 1, fiscalStartMonth - 1, 0);

    await queryRunner.query(
      `INSERT INTO fiscal_years (company_id, year_name, start_date, end_date, is_closed) 
       VALUES ($1, $2, $3, $4, $5)`,
      [companyId, `FY ${fiscalYear}-${fiscalYear + 1}`, startDate, endDate, false]
    );
  }

  private getCountryConfig(countryCode: string) {
    const configs = {
      AE: { currencyCode: 'AED', fiscalYearStartMonth: 1 },
      SA: { currencyCode: 'SAR', fiscalYearStartMonth: 1 },
      EG: { currencyCode: 'EGP', fiscalYearStartMonth: 7 },
      PK: { currencyCode: 'PKR', fiscalYearStartMonth: 7 },
      US: { currencyCode: 'USD', fiscalYearStartMonth: 1 }
    };
    return configs[countryCode] || configs.AE;
  }
}