import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('user_roles')
export class UserRole {
  @PrimaryColumn({ name: 'company_id' })
  companyId: string;

  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @PrimaryColumn({ name: 'role_id' })
  roleId: string;

  @ManyToOne('Company')
  @JoinColumn({ name: 'company_id' })
  company: unknown;

  @ManyToOne('User', 'userRoles')
  @JoinColumn({ name: 'user_id' })
  user: unknown;

  @ManyToOne('Role', 'userRoles')
  @JoinColumn({ name: 'role_id' })
  role: unknown;
}