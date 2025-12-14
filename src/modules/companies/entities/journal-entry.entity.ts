import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
  Check,
} from 'typeorm';

export enum EntryStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  POSTED = 'posted',
  CANCELLED = 'cancelled',
  REVERSED = 'reversed',
}

@Entity('journal_entries')
@Unique('uq_voucher_no', ['companyId', 'voucherNo'])
@Check('chk_posted', "(posted = TRUE AND posted_at IS NOT NULL) OR (posted = FALSE)")
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'fiscal_year_id' })
  fiscalYearId: string;

  @Column({ name: 'voucher_type_id' })
  voucherTypeId: string;

  @Column({ name: 'voucher_no', length: 50 })
  voucherNo: string;

  @Column({ name: 'entry_date', type: 'date' })
  entryDate: Date;

  @Column({ name: 'posting_date', type: 'date' })
  postingDate: Date;

  @Column({ length: 100, nullable: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'source_module', length: 50, nullable: true })
  sourceModule: string;

  @Column({ type: 'enum', enum: EntryStatus, default: EntryStatus.DRAFT })
  status: EntryStatus;

  @Column({ default: false })
  posted: boolean;

  @Column({ name: 'posted_at', nullable: true })
  postedAt: Date;

  @Column({ name: 'posted_by', nullable: true })
  postedBy: string;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  @Column({ name: 'reversed_by_id', nullable: true })
  reversedById: string;

  @Column({ name: 'reversal_of_id', nullable: true })
  reversalOfId: string;

  @Column({ name: 'attachment_urls', type: 'text', array: true, nullable: true })
  attachmentUrls: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne('Company')
  @JoinColumn({ name: 'company_id' })
  company: unknown;

  @ManyToOne('FiscalYear')
  @JoinColumn({ name: 'fiscal_year_id' })
  fiscalYear: unknown;

  @ManyToOne('VoucherType')
  @JoinColumn({ name: 'voucher_type_id' })
  voucherType: unknown;

  @ManyToOne('User')
  @JoinColumn({ name: 'created_by' })
  creator: unknown;

  @ManyToOne('User')
  @JoinColumn({ name: 'posted_by' })
  poster: unknown;

  @ManyToOne('User')
  @JoinColumn({ name: 'approved_by' })
  approver: unknown;

  @ManyToOne('JournalEntry')
  @JoinColumn({ name: 'reversed_by_id' })
  reversedBy: JournalEntry;

  @ManyToOne('JournalEntry')
  @JoinColumn({ name: 'reversal_of_id' })
  reversalOf: JournalEntry;

  @OneToMany('JournalEntryLine', 'journalEntry')
  lines: unknown[];

  @OneToMany('Invoice', 'voucher')
  invoices: unknown[];
}