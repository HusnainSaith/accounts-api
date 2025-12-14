import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { InvoiceItem } from '../../invoice-items/entities/invoice-item.entity';

export enum InvoiceType {
  FULL = 'full',
  SIMPLIFIED = 'simplified'
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'invoice_number', length: 100 })
  invoiceNumber: string;

  @Column({ name: 'invoice_sequence', type: 'bigint', nullable: true })
  invoiceSequence: number;

  @Column({ name: 'invoice_type', type: 'enum', enum: InvoiceType })
  invoiceType: InvoiceType;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;



  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date;

  @Column({ name: 'supply_date', type: 'date', nullable: true })
  supplyDate: Date;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  subtotal: number;

  @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2 })
  vatRate: number;

  @Column({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 2 })
  vatAmount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2 })
  totalAmount: number;

  @Column({ name: 'currency_code', length: 3 })
  currencyCode: string;

  @Column({ name: 'exchange_rate_to_aed', type: 'decimal', precision: 18, scale: 6, nullable: true })
  exchangeRateToAed: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

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

  @Column({ name: 'pdf_path', length: 500, nullable: true })
  pdfPath: string;

  @Column({ name: 'qr_code_data', type: 'text', nullable: true })
  qrCodeData: string;

  @Column({ name: 'created_by', nullable: true })
  createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;



  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date;

  @ManyToOne(() => Company, company => company.invoices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Customer, customer => customer.invoices)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => InvoiceItem, invoiceItem => invoiceItem.invoice)
  invoiceItems: InvoiceItem[];
}