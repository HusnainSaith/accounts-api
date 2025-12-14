import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

@Entity('invoice_lines')
@Unique('uq_invoice_line', ['invoiceId', 'lineNo'])
export class InvoiceLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_id' })
  invoiceId: string;

  @Column({ name: 'line_no', type: 'integer' })
  lineNo: number;

  @Column({ name: 'item_id', nullable: true })
  itemId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 1 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 2 })
  unitPrice: number;

  @Column({ name: 'discount_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountPercent: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'tax_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
  taxPercent: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'line_total', type: 'decimal', precision: 18, scale: 2 })
  lineTotal: number;

  @Column({ name: 'account_id', nullable: true })
  accountId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne('Invoice')
  @JoinColumn({ name: 'invoice_id' })
  invoice: unknown;

  @ManyToOne('Account')
  @JoinColumn({ name: 'account_id' })
  account: unknown;
}