import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Check,
} from 'typeorm';

@Entity('journal_entry_lines')
@Unique('uq_line_no', ['journalEntryId', 'lineNo'])
@Check('chk_debit_credit', "(debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0) OR (debit = 0 AND credit = 0)")
export class JournalEntryLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'journal_entry_id' })
  journalEntryId: string;

  @Column({ name: 'line_no', type: 'integer' })
  lineNo: number;

  @Column({ name: 'account_id' })
  accountId: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  debit: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  credit: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'party_id', nullable: true })
  partyId: string;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'tax_category_id', nullable: true })
  taxCategoryId: string;

  @Column({ name: 'cost_center_id', nullable: true })
  costCenterId: string;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @Column({ name: 'reconciliation_id', nullable: true })
  reconciliationId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne('JournalEntry', 'lines')
  @JoinColumn({ name: 'journal_entry_id' })
  journalEntry: unknown;

  @ManyToOne('Account', 'journalEntryLines')
  @JoinColumn({ name: 'account_id' })
  account: unknown;

  @ManyToOne('Constant', 'journalEntryLines')
  @JoinColumn({ name: 'party_id' })
  party: unknown;
}