import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

@Entity('expense_categories')
export class ExpenseCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ length: 50, nullable: true })
  code: string;

  @Column({ name: 'name_en', length: 255 })
  nameEn: string;

  @Column({ name: 'name_ar', length: 255, nullable: true })
  nameAr: string;

  @Column({ name: 'description_en', type: 'text', nullable: true })
  descriptionEn: string;

  @Column({ name: 'description_ar', type: 'text', nullable: true })
  descriptionAr: string;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => Expense, expense => expense.category)
  expenses: Expense[];
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @Column({ name: 'vendor_en', length: 255 })
  vendorEn: string;

  @Column({ name: 'vendor_ar', length: 255, nullable: true })
  vendorAr: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  amount: number;

  @Column({ length: 3 })
  currency: string;

  @Column({ name: 'expense_date', type: 'date', default: () => 'CURRENT_DATE' })
  expenseDate: Date;

  @Column({ name: 'taxable', default: false })
  taxable: boolean;

  @Column({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 4, default: 0 })
  vatAmount: number;

  @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  vatRate: number;

  @Column({ name: 'is_deductible', default: true })
  isDeductible: boolean;

  @Column({ name: 'receipt_s3_key', length: 500, nullable: true })
  receiptS3Key: string;

  @Column({ name: 'ocr_extraction', type: 'jsonb', nullable: true })
  ocrExtraction: Record<string, any>;

  @Column({ name: 'ocr_language', length: 10, nullable: true })
  ocrLanguage: string;

  @Column({ name: 'notes_en', type: 'text', nullable: true })
  notesEn: string;

  @Column({ name: 'notes_ar', type: 'text', nullable: true })
  notesAr: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => ExpenseCategory, category => category.expenses, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: ExpenseCategory;
}

@Entity('ocr_extractions')
export class OcrExtraction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'receipt_s3_key', length: 500 })
  receiptS3Key: string;

  @Column({ name: 'extracted', type: 'jsonb', nullable: true })
  extracted: Record<string, any>;

  @Column({ name: 'confidence', type: 'jsonb', nullable: true })
  confidence: Record<string, any>;

  @Column({ length: 50, default: 'tesseract' })
  source: string;

  @Column({ length: 30, default: 'parsed' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt: Date;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

export enum PaymentMethod {
  BANK = 'bank',
  CASH = 'cash',
  CARD = 'card',
  ONLINE = 'online',
  CHEQUE = 'cheque',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'invoice_id', nullable: true })
  invoiceId: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  amount: number;

  @Column({ length: 3 })
  currency: string;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({ name: 'payment_date', type: 'timestamp', default: () => 'now()' })
  paymentDate: Date;

  @Column({ name: 'reference_number', length: 255, nullable: true })
  referenceNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}

@Entity('company_counters')
export class CompanyCounter {
  @Column({ name: 'company_id', primary: true })
  companyId: string;

  @Column({ primary: true, length: 100 })
  name: string;

  @Column({ name: 'last_value', type: 'bigint', default: 0 })
  lastValue: number;

  @Column({ length: 50, nullable: true })
  prefix: string;

  @Column({ length: 100, nullable: true })
  format: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
