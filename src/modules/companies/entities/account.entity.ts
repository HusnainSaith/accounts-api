import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
  Check,
} from 'typeorm';

export enum AccountType {
  ASSET = 'asset',
  LIABILITY = 'liability',
  EQUITY = 'equity',
  INCOME = 'income',
  EXPENSE = 'expense',
}

export enum AccountLevel {
  LEVEL_1 = '1',
  LEVEL_2 = '2',
  LEVEL_3 = '3',
  LEVEL_4 = '4',
}

@Entity('accounts')
@Unique('uq_account_code', ['companyId', 'code'])
@Check('chk_posting_level', "(level = '4' AND is_posting = TRUE) OR (level IN ('1','2','3') AND is_posting = FALSE)")
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: AccountType })
  type: AccountType;

  @Column({ type: 'enum', enum: AccountLevel })
  level: AccountLevel;

  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @Column({ name: 'is_posting', default: false })
  isPosting: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @Column({ name: 'opening_balance', type: 'decimal', precision: 18, scale: 2, default: 0 })
  openingBalance: number;

  @Column({ name: 'opening_balance_type', length: 6, nullable: true })
  openingBalanceType: 'debit' | 'credit';

  @Column({ name: 'currency_code', length: 3, nullable: true })
  currencyCode: string;

  @Column({ name: 'allow_reconciliation', default: false })
  allowReconciliation: boolean;

  @Column({ name: 'tax_category_id', nullable: true })
  taxCategoryId: string;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne('Company', 'accounts')
  @JoinColumn({ name: 'company_id' })
  company: unknown;

  @ManyToOne('Account', 'children')
  @JoinColumn({ name: 'parent_id' })
  parent: Account;

  @OneToMany('Account', 'parent')
  children: Account[];

  @OneToMany('Constant', 'account')
  constants: unknown[];

  @OneToMany('JournalEntryLine', 'account')
  journalEntryLines: unknown[];
}