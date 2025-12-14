import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryColumn({ name: 'role_id' })
  roleId: string;

  @PrimaryColumn({ name: 'permission_id' })
  permissionId: string;

  @ManyToOne('Role', 'rolePermissions')
  @JoinColumn({ name: 'role_id' })
  role: unknown;

  @ManyToOne('Permission', 'rolePermissions')
  @JoinColumn({ name: 'permission_id' })
  permission: unknown;
}