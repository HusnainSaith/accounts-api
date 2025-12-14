import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Unique, Check } from 'typeorm';

export enum ConstantType {
  CUSTOMER = 'customer',
  SUPPLIER = 'supplier',
  BOTH = 'both',
}

@Entity('constant')
@Unique('uq_constant_code', ['companyId', 'code'])
@Check('chk_constant_type', "type IN ('customer', 'supplier', 'both')")
export class Constant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'enum', enum: ConstantType })
  type: ConstantType;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'tax_registration_no', length: 100, nullable: true })
  taxRegistrationNo: string;

  @Column({ name: 'credit_limit', type: 'decimal', precision: 18, scale: 2, default: 0 })
  creditLimit: number;

  @Column({ name: 'payment_terms', type: 'integer', default: 30 })
  paymentTerms: number;

  @Column({ name: 'account_id', nullable: true })
  accountId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne('Company', 'constants')
  @JoinColumn({ name: 'company_id' })
  company: unknown;

  @ManyToOne('Account', 'constants')
  @JoinColumn({ name: 'account_id' })
  account: unknown;

  @OneToMany('Invoice', 'party')
  invoices: any[];

  @OneToMany('JournalEntryLine', 'party')
  journalEntryLines: any[];
}