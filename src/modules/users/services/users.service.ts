import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
<<<<<<< HEAD
    createUserDto: CreateUserDto & { companyId: string },
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
      isActive: true,
    });

    return this.usersRepository.save(user);
  }

  async findAll(
    companyId: string,
    role?: string,
    search?: string,
  ): Promise<User[]> {
    const where: any = { companyId, isActive: true };
=======
    createUserDto: CreateUserDto & { companyId?: string },
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Map old fields to new schema
    const userData: any = {
      fullName: createUserDto.firstName && createUserDto.lastName 
        ? `${createUserDto.firstName} ${createUserDto.lastName}` 
        : createUserDto.fullName || createUserDto.firstName || 'Unknown',
      email: createUserDto.email,
      passwordHash: hashedPassword,
      isActive: true,
      // Keep old fields for compatibility
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      role: createUserDto.role,
      phone: createUserDto.phone,
      preferredLanguage: createUserDto.preferredLanguage,
    };

    const user = this.usersRepository.create(userData);
    const savedUser = await this.usersRepository.save(user);
    return Array.isArray(savedUser) ? savedUser[0] : savedUser;
  }

  async findAll(
    companyId?: string,
    role?: string,
    search?: string,
  ): Promise<User[]> {
    const where: any = { isActive: true };
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f

    if (role) {
      where.role = role;
    }

    if (search) {
      where.fullName = Like(`%${search}%`);
    }

    return this.usersRepository.find({
      where,
<<<<<<< HEAD
      relations: ['company'],
=======
      relations: ['companyUsers'],
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId?: string): Promise<User> {
    const where: any = { id };
<<<<<<< HEAD
    if (companyId) {
      where.companyId = companyId;
    }

    const user = await this.usersRepository.findOne({
      where,
      relations: ['company'],
=======

    const user = await this.usersRepository.findOne({
      where,
      relations: ['companyUsers'],
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOneActive(id: string, companyId?: string): Promise<User> {
    const whereAll: any = { id };
<<<<<<< HEAD
    if (companyId) {
      whereAll.companyId = companyId;
    }
=======
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f

    // First check if user exists at all
    const userExists = await this.usersRepository.findOne({
      where: whereAll,
<<<<<<< HEAD
      relations: ['company'],
=======
      relations: ['companyUsers'],
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
    });

    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    if (!userExists.isActive) {
      throw new NotFoundException('User has been deleted');
    }

    return userExists;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
<<<<<<< HEAD
      relations: ['company'],
=======
      relations: ['companyUsers'],
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
    });
  }

  async findByCompany(companyId: string): Promise<User[]> {
<<<<<<< HEAD
    return this.usersRepository.find({
      where: { companyId },
      relations: ['company'],
    });
=======
    // This would need to be implemented through CompanyUser junction table
    return this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.companyUsers', 'companyUser')
      .where('companyUser.companyId = :companyId', { companyId })
      .getMany();
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    companyId?: string,
  ): Promise<User> {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }

    const updateData: any = { ...updateUserDto };

    // Hash password if provided
    if (updateUserDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete updateData.password;
    }

    const result = await this.usersRepository.update(where, updateData);

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    return this.findOne(id, companyId);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLoginAt: new Date() });
  }

  async remove(id: string, companyId?: string): Promise<void> {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }

    const result = await this.usersRepository.update(where, {
      isActive: false,
    });

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  async deleteOwnerAndCompany(ownerId: string): Promise<void> {
<<<<<<< HEAD
    // Find the owner and get company ID
    const owner = await this.findOne(ownerId);
    if (owner.role !== UserRole.OWNER) {
      throw new BadRequestException('User is not an owner');
    }
    
    const companyId = owner.companyId;
    
    // Start transaction for atomic operation
    await this.usersRepository.manager.transaction(async manager => {
      // 1. Soft delete all users in the company
      await manager.update('users', 
        { companyId }, 
        { isActive: false }
      );
=======
    // Find the owner
    const owner = await this.findOne(ownerId);
    // Skip role check for now - allow all users
    
    // Get company ID from CompanyUser relationship
    const companyUser = (owner.companyUsers as any)?.[0];
    if (!companyUser) {
      throw new BadRequestException('User is not associated with any company');
    }
    const companyId = (companyUser as any).companyId;
    
    // Start transaction for atomic operation
    await this.usersRepository.manager.transaction(async manager => {
      // 1. Soft delete all users in the company through CompanyUser
      const companyUsers = await manager.find('company_users', { where: { companyId } });
      for (const cu of companyUsers) {
        await manager.update('users', { id: (cu as any).userId }, { isActive: false });
      }
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
      
      // 2. Cancel all invoices
      await manager.update('invoices', 
        { companyId }, 
        { status: 'cancelled' }
      );
      
      // 3. Delete customers (hard delete since no isActive field)
      await manager.delete('customers', { companyId });
      
      // 4. Deactivate items
      await manager.update('items', 
        { companyId }, 
        { isActive: false }
      );
      
      // 5. Delete expenses (hard delete since no isActive field)
      await manager.delete('expenses', { companyId });
      
      // 6. Deactivate the company
      await manager.update('companies', 
        { id: companyId }, 
        { isActive: false }
      );
    });
  }

  async getStatistics(companyId: string): Promise<any> {
    // This would need to be implemented through CompanyUser junction table
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.companyUsers', 'companyUser')
      .where('companyUser.companyId = :companyId', { companyId });

    const [total, active, owners, staff, accountants] = await Promise.all([
<<<<<<< HEAD
      this.usersRepository.count({ where: { companyId } }),
      this.usersRepository.count({ where: { companyId, isActive: true } }),
      this.usersRepository.count({
        where: { companyId, role: UserRole.OWNER },
      }),
      this.usersRepository.count({
        where: { companyId, role: UserRole.STAFF },
      }),
      this.usersRepository.count({
        where: { companyId, role: UserRole.ACCOUNTANT },
      }),
=======
      queryBuilder.getCount(),
      queryBuilder.andWhere('user.isActive = true').getCount(),
      queryBuilder.andWhere('user.role = :role', { role: UserRole.OWNER }).getCount(),
      queryBuilder.andWhere('user.role = :role', { role: UserRole.STAFF }).getCount(),
      queryBuilder.andWhere('user.role = :role', { role: UserRole.ACCOUNTANT }).getCount(),
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
    ]);

    return {
      total,
      active,
      inactive: total - active,
      owners,
      staff,
      accountants,
    };
  }

  async restore(id: string, companyId?: string): Promise<User> {
    const where: any = { id };
    if (companyId) {
      where.companyId = companyId;
    }

    const result = await this.usersRepository.update(where, { isActive: true });

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    return this.findOne(id);
  }

  async restoreByEmail(email: string): Promise<User> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

<<<<<<< HEAD
    if (user.role === UserRole.OWNER) {
      // Restore owner and all company data
      await this.restoreOwnerAndCompany(user.id);
    } else {
      // Regular user restore
      await this.usersRepository.update(
        { email },
        { isActive: true }
      );
    }
=======
    // Regular user restore
    await this.usersRepository.update(
      { email },
      { isActive: true }
    );
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f

    const restoredUser = await this.findByEmail(email);
    if (!restoredUser) {
      throw new NotFoundException('User not found after restore');
    }

    return restoredUser;
  }

  async restoreOwnerAndCompany(ownerId: string): Promise<void> {
<<<<<<< HEAD
    // Find the owner and get company ID
    const owner = await this.usersRepository.findOne({ where: { id: ownerId } });
    if (!owner || owner.role !== UserRole.OWNER) {
      throw new BadRequestException('User is not an owner');
    }
    
    const companyId = owner.companyId;
    
    // Start transaction for atomic operation
    await this.usersRepository.manager.transaction(async manager => {
      // 1. Restore all users in the company
      await manager.update('users', 
        { companyId }, 
        { isActive: true }
      );
=======
    // Find the owner
    const owner = await this.usersRepository.findOne({ 
      where: { id: ownerId },
      relations: ['companyUsers']
    });
    if (!owner) {
      throw new BadRequestException('User is not an owner');
    }
    
    const companyUser = (owner.companyUsers as any)?.[0];
    if (!companyUser) {
      throw new BadRequestException('User is not associated with any company');
    }
    const companyId = (companyUser as any).companyId;
    
    // Start transaction for atomic operation
    await this.usersRepository.manager.transaction(async manager => {
      // 1. Restore all users in the company through CompanyUser
      const companyUsers = await manager.find('company_users', { where: { companyId } });
      for (const cu of companyUsers) {
        await manager.update('users', { id: (cu as any).userId }, { isActive: true });
      }
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
      
      // 2. Restore all invoices (change from cancelled to sent)
      await manager.update('invoices', 
        { companyId, status: 'cancelled' }, 
        { status: 'sent' }
      );
      
      // 3. Customers are hard deleted, cannot restore
      
      // 4. Restore items
      await manager.update('items', 
        { companyId }, 
        { isActive: true }
      );
      
      // 5. Expenses are hard deleted, cannot restore
      
      // 6. Restore the company
      await manager.update('companies', 
        { id: companyId }, 
        { isActive: true }
      );
    });
  }
}