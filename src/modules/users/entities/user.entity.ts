import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum UserRole {
  OWNER = 'owner',
  STAFF = 'staff',
  ACCOUNTANT = 'accountant',
}

export enum UserLanguage {
  EN = 'en',
  AR = 'ar',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'first_name', length: 255 })
  firstName: string;

  @Column({ name: 'last_name', length: 255 })
  lastName: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({
    name: 'preferred_language',
    type: 'enum',
    enum: UserLanguage,
    default: UserLanguage.EN,
  })
  preferredLanguage: UserLanguage;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login', nullable: true })
  lastLogin: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne('Company', 'users')
  @JoinColumn({ name: 'company_id' })
  company: unknown;
}
