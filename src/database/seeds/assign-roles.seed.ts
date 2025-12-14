import { DataSource } from 'typeorm';
<<<<<<< HEAD
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/roles/entities/role.entity';
=======
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f

export class AssignRolesSeed {
  async run(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();
    
    try {
      // Create default system roles if they don't exist
      const roles = [
        { code: 'super_admin', name: 'Super Administrator', is_system: true },
        { code: 'owner', name: 'Owner', is_system: true },
        { code: 'admin', name: 'Administrator', is_system: true },
        { code: 'accountant', name: 'Accountant', is_system: true },
        { code: 'user', name: 'User', is_system: true }
      ];

<<<<<<< HEAD
    // Get all users
    const users = await userRepository.find();

    if (users.length === 0) {
      console.log('✅ No users found');
      return;
    }

    console.log(`✅ Found ${users.length} users with role enum values`);
    console.log('✅ Role assignment is now handled by the role enum field directly');
=======
      for (const role of roles) {
        const existing = await queryRunner.query(
          `SELECT id FROM roles WHERE company_id IS NULL AND code = $1`,
          [role.code]
        );
        
        if (existing.length === 0) {
          await queryRunner.query(
            `INSERT INTO roles (company_id, code, name, is_system) VALUES (NULL, $1, $2, $3)`,
            [role.code, role.name, role.is_system]
          );
        }
      }

      // Assign permissions to roles
      const rolePermissions = [
        // Super Admin - all permissions
        { roleCode: 'super_admin', permissions: [
          'users.create', 'users.read', 'users.update', 'users.delete',
          'roles.create', 'roles.read', 'roles.update', 'roles.delete',
          'permissions.create', 'permissions.read', 'permissions.update', 'permissions.delete',
          'companies.create', 'companies.read', 'companies.update', 'companies.delete',
          'accounts.create', 'accounts.read', 'accounts.update', 'accounts.delete',
          'invoices.create', 'invoices.read', 'invoices.update', 'invoices.delete',
          'reports.view', 'reports.export', 'audit.read', 'system.settings', 'fiscal.close',
          'vouchers.approve', 'vouchers.post', 'vouchers.reverse'
        ]},
        
        // Owner - full company access
        { roleCode: 'owner', permissions: [
          'users.create', 'users.read', 'users.update', 'users.delete',
          'roles.create', 'roles.read', 'roles.update', 'roles.delete',
          'permissions.read',
          'companies.read', 'companies.update',
          'accounts.create', 'accounts.read', 'accounts.update', 'accounts.delete',
          'invoices.create', 'invoices.read', 'invoices.update', 'invoices.delete',
          'reports.view', 'reports.export', 'audit.read', 'system.settings', 'fiscal.close',
          'vouchers.approve', 'vouchers.post', 'vouchers.reverse'
        ]},
        
        // Admin - most permissions except system-level
        { roleCode: 'admin', permissions: [
          'users.create', 'users.read', 'users.update',
          'roles.read', 'permissions.read',
          'companies.read', 'companies.update',
          'accounts.create', 'accounts.read', 'accounts.update', 'accounts.delete',
          'invoices.create', 'invoices.read', 'invoices.update', 'invoices.delete',
          'reports.view', 'reports.export'
        ]},
        
        // Accountant - accounting focused permissions
        { roleCode: 'accountant', permissions: [
          'accounts.create', 'accounts.read', 'accounts.update',
          'invoices.create', 'invoices.read', 'invoices.update',
          'reports.view', 'reports.export'
        ]},
        
        // User - basic read permissions
        { roleCode: 'user', permissions: [
          'accounts.read', 'invoices.read', 'reports.view'
        ]}
      ];

      for (const rolePermission of rolePermissions) {
        for (const permissionName of rolePermission.permissions) {
          const existing = await queryRunner.query(
            `SELECT 1 FROM role_permissions rp
             JOIN roles r ON r.id = rp.role_id
             JOIN permissions p ON p.id = rp.permission_id
             WHERE r.code = $1 AND r.company_id IS NULL AND p.code = $2`,
            [rolePermission.roleCode, permissionName]
          );
          
          if (existing.length === 0) {
            await queryRunner.query(
              `INSERT INTO role_permissions (role_id, permission_id)
               SELECT r.id, p.id 
               FROM roles r, permissions p 
               WHERE r.code = $1 AND r.company_id IS NULL AND p.code = $2`,
              [rolePermission.roleCode, permissionName]
            );
          }
        }
      }
      
      console.log('✅ Role permissions assigned successfully');
    } catch (error) {
      console.error('❌ Error assigning role permissions:', error);
      throw error;
    }
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
  }
}