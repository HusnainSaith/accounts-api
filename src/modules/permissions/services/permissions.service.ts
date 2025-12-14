import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, DataSource } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto, UpdatePermissionDto } from '../dto';
import { PermissionsSeed } from '../../../database/seeds/permissions.seed';
import { AssignRolesSeed } from '../../../database/seeds/assign-roles.seed';

@Injectable()
export class PermissionsService implements OnModuleInit {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    const permissionsSeed = new PermissionsSeed();
    await permissionsSeed.run(this.dataSource);
    
    const assignRolesSeed = new AssignRolesSeed();
    await assignRolesSeed.run(this.dataSource);
  }

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionsRepository.create(createPermissionDto);
    return this.permissionsRepository.save(permission);
  }

  async findAll(search?: string): Promise<Permission[]> {
    const where: any = {};
    
    if (search) {
      where.name = Like(`%${search}%`);
    }

    return this.permissionsRepository.find({
      where,
      order: { name: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionsRepository.findOne({ where: { id } });
    
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    
    return permission;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    const result = await this.permissionsRepository.update(id, updatePermissionDto);
    
    if (result.affected === 0) {
      throw new NotFoundException('Permission not found');
    }
    
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.permissionsRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException('Permission not found');
    }
  }


}