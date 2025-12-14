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

@Entity('fiscal_years')
@Unique('uq_fiscal_year', ['companyId', 'yearName'])
@Check('chk_date_range', 'end_date > start_date')
export class FiscalYear {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'year_name', length: 50 })
  yearName: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column({ name: 'is_closed', default: false })
  isClosed: boolean;

  @Column({ name: 'closed_at', nullable: true })
  closedAt: Date;

  @Column({ name: 'closed_by', nullable: true })
  closedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne('Company', 'fiscalYears')
  @JoinColumn({ name: 'company_id' })
  company: unknown;

  @ManyToOne('User')
  @JoinColumn({ name: 'closed_by' })
  closedByUser: unknown;
}