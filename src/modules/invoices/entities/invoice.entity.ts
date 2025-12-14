import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Unique, Check, Generated } from 'typeorm';
import { Constant } from '../../constant/entities/constant.entity';

export enum InvoiceType {
  SALES = 'sales',
  PURCHASE = 'purchase',
  // Keep existing for backward compatibility
  FULL = 'full',
  SIMPLIFIED = 'simplified'
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  ISSUED = 'issued',
  PARTIALLY_PAID = 'partially_paid',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  // Keep existing for backward compatibility
  SENT = 'sent'
}

@Entity('invoices')
@Unique('uq_invoice_no', ['companyId', 'invoiceNo'])

export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

<<<<<<< HEAD
  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'invoice_number', length: 100 })
  invoiceNumber: string;

  @Column({ name: 'invoice_sequence', type: 'bigint', nullable: true })
  invoiceSequence: number;

=======
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
  @Column({ name: 'invoice_type', type: 'enum', enum: InvoiceType })
  invoiceType: InvoiceType;

  @Column({ name: 'invoice_no', length: 50 })
  invoiceNo: string;

  @Column({ name: 'invoice_date', type: 'date' })
  invoiceDate: Date;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: Date;

  @Column({ name: 'party_id' })
  partyId: string;

  @Column({ name: 'currency_code', length: 3 })
  currencyCode: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1 })
  exchangeRate: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  subtotal: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2 })
  totalAmount: number;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  paidAmount: number;

  @Generated()
  @Column({ name: 'balance_amount', type: 'decimal', precision: 18, scale: 2 })
  balanceAmount: number;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @Column({ name: 'voucher_id', nullable: true })
  voucherId: string;

  @Column({ name: 'payment_terms', type: 'text', nullable: true })
  paymentTerms: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

<<<<<<< HEAD
  @Column({ name: 'notes_ar', type: 'text', nullable: true })
  notesAr: string;

  @Column({ name: 'seller_trn', length: 64, nullable: true })
  sellerTrn: string;

  @Column({ name: 'buyer_trn', length: 64, nullable: true })
  buyerTrn: string;

  @Column({ name: 'vat_rate_used', type: 'decimal', precision: 5, scale: 2, nullable: true })
  vatRateUsed: number;

  @Column({ name: 'payment_method', length: 255, nullable: true })
  paymentMethod: string;
=======
  @Column({ name: 'terms_conditions', type: 'text', nullable: true })
  termsConditions: string;
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f

  @Column({ name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Keep existing properties for backward compatibility
  @Column({ name: 'invoice_number', length: 100, nullable: true })
  invoiceNumber?: string;

  @Column({ name: 'invoice_sequence', type: 'bigint', nullable: true })
  invoiceSequence?: number;

  @Column({ name: 'supply_date', type: 'date', nullable: true })
  supplyDate?: Date;

  @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  vatRate?: number;

  @Column({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 2, nullable: true })
  vatAmount?: number;

  @Column({ name: 'exchange_rate_to_aed', type: 'decimal', precision: 18, scale: 6, nullable: true })
  exchangeRateToAed?: number;

  @Column({ name: 'notes_ar', type: 'text', nullable: true })
  notesAr?: string;

  @Column({ name: 'seller_trn', length: 64, nullable: true })
  sellerTrn?: string;

  @Column({ name: 'buyer_trn', length: 64, nullable: true })
  buyerTrn?: string;

  @Column({ name: 'vat_rate_used', type: 'decimal', precision: 5, scale: 2, nullable: true })
  vatRateUsed?: number;

  @Column({ name: 'payment_method', length: 255, nullable: true })
  paymentMethod?: string;

  @Column({ name: 'pdf_path', length: 500, nullable: true })
  pdfPath?: string;

  @Column({ name: 'qr_code_data', type: 'text', nullable: true })
  qrCodeData?: string;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: Date;

  @ManyToOne('Company', 'invoices')
  @JoinColumn({ name: 'company_id' })
  company: unknown;

  @ManyToOne(() => Constant, 'invoices')
  @JoinColumn({ name: 'party_id' })
  party: Constant;

  @ManyToOne('JournalEntry', 'invoices')
  @JoinColumn({ name: 'voucher_id' })
  voucher: unknown;

  @ManyToOne('User')
  @JoinColumn({ name: 'created_by' })
  creator: unknown;




}