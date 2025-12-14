import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../services/users.service';
import { CreateUserDto, UpdateUserDto } from '../dto';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';
import * as crypto from 'crypto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('users.create')
  create(
    @Body() createUserDto: CreateUserDto,
    @CompanyContext() companyId: string,
  ) {
    return this.usersService.create({ ...createUserDto, companyId });
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('users.read')
  findAll(
    @CompanyContext() companyId: string,
    @Query('role') role?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(companyId, role, search);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('users.read')
  getStatistics(@CompanyContext() companyId: string) {
    return this.usersService.getStatistics(companyId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('users.read')
  findOne(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.usersService.findOneActive(id, companyId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('users.update')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CompanyContext() companyId: string,
  ) {
    // First check if user exists and is active
    return this.usersService.findOneActive(id, companyId).then(() => {
      return this.usersService.update(id, updateUserDto, companyId);
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions('users.delete')
  async remove(@Param('id') id: string, @CompanyContext() companyId: string) {
    // Check if user is owner or regular user
    const user = await this.usersService.findOneActive(id, companyId);
    
<<<<<<< HEAD
    if (user.role === 'owner') {
      // Owner: Cascade delete everything
      await this.usersService.deleteOwnerAndCompany(id);
      return { message: 'Owner and all company data deleted successfully' };
    } else {
      // Regular user: Only delete this user
      await this.usersService.remove(id, companyId);
      return { message: 'User deleted successfully' };
    }
=======
    // Regular user: Only delete this user
    await this.usersService.remove(id, companyId);
    return { message: 'User deleted successfully' };
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
  }

  @Patch(':id/restore')
  async restore(@Param('id') id: string, @Body() body?: { newPassword?: string }) {
    // Check if user exists (even if inactive)
    const user = await this.usersService.findOne(id);
    
    // Reset password if provided
    if (body?.newPassword) {
      await this.usersService.update(id, { password: body.newPassword } as any);
    }
    
<<<<<<< HEAD
    if (user.role === 'owner') {
      // Owner: Restore everything
      await this.usersService.restoreOwnerAndCompany(id);
      
      // Get updated user after password reset
      const updatedUser = await this.usersService.findOne(id);
      
      // Generate new token for restored owner
      const jti = crypto.randomUUID();
      const payload = { 
        sub: updatedUser.id, 
        email: updatedUser.email,
        companyId: updatedUser.companyId,
        role: updatedUser.role,
        preferredLanguage: updatedUser.preferredLanguage,
        jti
      };
      
      return { 
        message: 'Owner and all company data restored successfully',
        access_token: this.jwtService.sign(payload),
        user: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          role: updatedUser.role,
          companyId: updatedUser.companyId
        }
      };
    } else {
      // Regular user: Only restore this user
      const restoredUser = await this.usersService.restore(id);
      
      // Generate new token for restored user
      const jti = crypto.randomUUID();
      const payload = { 
        sub: restoredUser.id, 
        email: restoredUser.email,
        companyId: restoredUser.companyId,
        role: restoredUser.role,
        preferredLanguage: restoredUser.preferredLanguage,
        jti
      };
      
      return { 
        message: 'User restored successfully',
        access_token: this.jwtService.sign(payload),
        user: {
          id: restoredUser.id,
          firstName: restoredUser.firstName,
          lastName: restoredUser.lastName,
          email: restoredUser.email,
          role: restoredUser.role,
          companyId: restoredUser.companyId
        }
      };
    }
=======
    // Regular user: Only restore this user
    const restoredUser = await this.usersService.restore(id);
    
    // Generate new token for restored user
    const jti = crypto.randomUUID();
    const payload = { 
      sub: restoredUser.id, 
      email: restoredUser.email,
      jti
    };
    
    return { 
      message: 'User restored successfully',
      access_token: this.jwtService.sign(payload),
      user: {
        id: restoredUser.id,
        fullName: restoredUser.fullName,
        email: restoredUser.email
      }
    };
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
  }
}