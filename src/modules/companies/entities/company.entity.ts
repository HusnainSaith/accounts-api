import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Check,
} from 'typeorm';

@Entity('companies')
@Check('chk_fiscal_month', 'fiscal_year_start_month BETWEEN 1 AND 12')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

<<<<<<< HEAD
  @Column({ name: 'name_ar', length: 255, nullable: true })
  nameAr: string;
=======
  @Column({ name: 'legal_name', length: 255, nullable: true })
  legalName: string;

  @Column({ name: 'registration_no', length: 100, nullable: true })
  registrationNo: string;

  @Column({ name: 'tax_registration_no', length: 100, nullable: true })
  taxRegistrationNo: string;
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f

  @Column({ name: 'country_code', length: 3 })
  countryCode: string;

  @Column({ name: 'currency_code', length: 3 })
  currencyCode: string;

<<<<<<< HEAD
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
=======
  @Column({ name: 'fiscal_year_start_month', type: 'integer', default: 1 })
  fiscalYearStartMonth: number;
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f

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

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: '{}' })
  settings: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany('User', 'company')
  users: unknown[];

  @OneToMany('Constant', 'company')
  constants: unknown[];

  @OneToMany('Invoice', 'company')
  invoices: unknown[];

  @OneToMany('Role', 'company')
  roles: unknown[];

  @OneToMany('Account', 'company')
  accounts: unknown[];

  @OneToMany('FiscalYear', 'company')
  fiscalYears: unknown[];
}