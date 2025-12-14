import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

@Entity('company_users')
@Unique('uq_company_user', ['companyId', 'userId'])
export class CompanyUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne('Company', 'companyUsers')
  @JoinColumn({ name: 'company_id' })
  company: unknown;

  @ManyToOne('User', 'companyUsers')
  @JoinColumn({ name: 'user_id' })
  user: unknown;
}