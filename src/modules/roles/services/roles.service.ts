import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { CreateRoleDto, UpdateRoleDto } from '../dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.rolesRepository.create(createRoleDto);
    return await this.rolesRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({
      relations: ['rolePermissions'],
      order: { createdAt: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Role | null> {
    return this.rolesRepository.findOne({ 
      where: { id },
      relations: ['rolePermissions']
    });
  }

  async findByName(name: string): Promise<Role | null> {
    return this.rolesRepository.findOne({ 
      where: { name },
      relations: ['rolePermissions']
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role | null> {
    await this.rolesRepository.update(id, updateRoleDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.rolesRepository.delete(id);
  }

  async seedDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        code: 'OWNER',
        name: 'Owner',
        isSystem: true
      },
      {
        code: 'STAFF',
        name: 'Staff',
        isSystem: true
      },
      {
        code: 'ACCOUNTANT',
        name: 'Accountant',
        isSystem: true
      }
    ];

    for (const roleData of defaultRoles) {
      const existing = await this.findByName(roleData.name);
      if (!existing) {
        await this.create(roleData);
      }
    }
  }
}