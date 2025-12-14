import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany('RolePermission', 'permission')
  rolePermissions: unknown[];
}
