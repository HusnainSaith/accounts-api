import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

export enum VoucherNature {
  PAYMENT = 'payment',
  RECEIPT = 'receipt',
  JOURNAL = 'journal',
  CONTRA = 'contra',
  SALES = 'sales',
  PURCHASE = 'purchase',
  CREDIT_NOTE = 'credit_note',
  DEBIT_NOTE = 'debit_note',
  OPENING = 'opening',
}

@Entity('voucher_types')
@Unique('uq_voucher_type', ['companyId', 'code'])
export class VoucherType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ length: 10 })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'enum', enum: VoucherNature })
  nature: VoucherNature;

  @Column({ name: 'auto_numbering', default: true })
  autoNumbering: boolean;

  @Column({ length: 20, nullable: true })
  prefix: string;

  @Column({ name: 'next_sequence', type: 'bigint', default: 1 })
  nextSequence: number;

  @Column({ name: 'reset_frequency', length: 20, default: 'yearly' })
  resetFrequency: string;

  @Column({ name: 'requires_approval', default: false })
  requiresApproval: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne('Company')
  @JoinColumn({ name: 'company_id' })
  company: unknown;
}