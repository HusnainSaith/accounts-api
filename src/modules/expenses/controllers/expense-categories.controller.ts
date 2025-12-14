import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors } from '@nestjs/common';
import { ExpenseCategoriesService } from '../services/expense-categories.service';
import { CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from '../dto/expense.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CompanyGuard } from '../../../common/guards/company.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RLSInterceptor } from '../../../common/interceptors/rls.interceptor';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('expense-categories')
@UseGuards(JwtAuthGuard, RolesGuard, CompanyGuard)
@UseInterceptors(RLSInterceptor)
export class ExpenseCategoriesController {
  constructor(private readonly categoriesService: ExpenseCategoriesService) {}

  @Post()
  @Roles('owner', 'staff')
  create(@Body() createDto: CreateExpenseCategoryDto, @CompanyContext() companyId: string) {
    return this.categoriesService.create({ ...createDto, companyId });
  }

  @Get()
  @Roles('owner', 'staff', 'accountant')
  findAll(@CompanyContext() companyId: string) {
    return this.categoriesService.findAll(companyId);
  }

  @Get(':id')
  @Roles('owner', 'staff', 'accountant')
  findOne(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.categoriesService.findOne(id, companyId);
  }

  @Patch(':id')
  @Roles('owner', 'staff')
  update(@Param('id') id: string, @Body() updateDto: UpdateExpenseCategoryDto, @CompanyContext() companyId: string) {
    return this.categoriesService.update(id, updateDto, companyId);
  }

  @Delete(':id')
  @Roles('owner')
  remove(@Param('id') id: string, @CompanyContext() companyId: string) {
    return this.categoriesService.remove(id, companyId);
  }
}
