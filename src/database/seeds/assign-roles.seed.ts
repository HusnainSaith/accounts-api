import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { Role } from '../../modules/roles/entities/role.entity';

export class AssignRolesSeed {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);

    // Get all users
    const users = await userRepository.find();

    if (users.length === 0) {
      console.log('✅ No users found');
      return;
    }

    console.log(`✅ Found ${users.length} users with role enum values`);
    console.log('✅ Role assignment is now handled by the role enum field directly');
  }
}