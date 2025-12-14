import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinTable,
  ManyToMany,
} from 'typeorm';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'name_ar', length: 255, nullable: true })
  nameAr: string;

  @Column({ name: 'country_code', length: 3 })
  countryCode: string;

  @Column({ name: 'currency_code', length: 3 })
  currencyCode: string;

  @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2 })
  vatRate: number;

  @Column({ length: 64, nullable: true })
  trn: string;

  @Column({ name: 'cr_number', length: 100, nullable: true })
  crNumber: string;

  @Column({ name: 'logo_url', length: 500, nullable: true })
  logoUrl: string;
  @Column({ name: 'logo_s3_key', length: 500, nullable: true })
  logoS3Key: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'is_vat_registered', default: false })
  isVatRegistered: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  settings: Record<string, any>;

  @Column({ name: 'default_vat_rate', type: 'decimal', precision: 5, scale: 2, default: 5.0 })
  defaultVatRate: number;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_test_account', default: false })
  isTestAccount: boolean;

  @OneToMany('User', 'company')
  users: unknown[];

  @OneToMany('Customer', 'company')
  customers: unknown[];

  @OneToMany('Item', 'company')
  items: unknown[];

  @OneToMany('Invoice', 'company')
  invoices: unknown[];

  @ManyToMany('ItemTemplate', 'companies')
  @JoinTable({
    name: 'company_item_templates',
    joinColumn: { name: 'company_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'item_template_id', referencedColumnName: 'id' },
  })
  itemTemplates: unknown[];
}