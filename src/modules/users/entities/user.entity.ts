import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
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

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash: string;

<<<<<<< HEAD
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

=======
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

<<<<<<< HEAD
  @ManyToOne('Company', 'users')
  @JoinColumn({ name: 'company_id' })
  company: unknown;
=======
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;



  @OneToMany('CompanyUser', 'user')
  companyUsers: unknown[];

  @OneToMany('UserRole', 'user')
  userRoles: unknown[];

  @OneToMany('AuditLog', 'actorUser')
  auditLogs: unknown[];
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
}
