import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Unique,
} from 'typeorm';

@Entity('roles')
@Unique('uq_role_code', ['companyId', 'code'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', nullable: true })
  companyId: string;

  @Column({ length: 50 })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne('Company', 'roles')
  @JoinColumn({ name: 'company_id' })
  company: unknown;

  @OneToMany('RolePermission', 'role')
  rolePermissions: unknown[];

  @OneToMany('UserRole', 'role')
  userRoles: unknown[];
}
