import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('account_balances')
export class AccountBalance {
  @PrimaryColumn({ name: 'company_id' })
  companyId: string;

  @PrimaryColumn({ name: 'account_id' })
  accountId: string;

  @PrimaryColumn({ type: 'date' })
  period: Date;

  @Column({ name: 'fiscal_year_id' })
  fiscalYearId: string;

  @Column({ name: 'opening_debit', type: 'decimal', precision: 18, scale: 2, default: 0 })
  openingDebit: number;

  @Column({ name: 'opening_credit', type: 'decimal', precision: 18, scale: 2, default: 0 })
  openingCredit: number;

  @Column({ name: 'period_debit', type: 'decimal', precision: 18, scale: 2, default: 0 })
  periodDebit: number;

  @Column({ name: 'period_credit', type: 'decimal', precision: 18, scale: 2, default: 0 })
  periodCredit: number;

  @Column({ name: 'closing_debit', type: 'decimal', precision: 18, scale: 2, default: 0 })
  closingDebit: number;

  @Column({ name: 'closing_credit', type: 'decimal', precision: 18, scale: 2, default: 0 })
  closingCredit: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne('Company')
  @JoinColumn({ name: 'company_id' })
  company: unknown;

  @ManyToOne('Account')
  @JoinColumn({ name: 'account_id' })
  account: unknown;

  @ManyToOne('FiscalYear')
  @JoinColumn({ name: 'fiscal_year_id' })
  fiscalYear: unknown;
}