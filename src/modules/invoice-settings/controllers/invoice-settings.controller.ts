import { Controller, Get, Post, Body, Patch, UseGuards, UseInterceptors } from '@nestjs/common';
import { InvoiceSettingsService } from '../services/invoice-settings.service';
import { CreateInvoiceSettingDto, UpdateInvoiceSettingDto } from '../dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CompanyGuard } from '../../../common/guards/company.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RLSInterceptor } from '../../../common/interceptors/rls.interceptor';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('invoice-settings')
@UseGuards(JwtAuthGuard, RolesGuard, CompanyGuard)
@UseInterceptors(RLSInterceptor)
export class InvoiceSettingsController {
  constructor(private readonly invoiceSettingsService: InvoiceSettingsService) {}

  @Post()
  @Roles('owner')
  create(@Body() createDto: CreateInvoiceSettingDto, @CompanyContext() companyId: string) {
    return this.invoiceSettingsService.create({ ...createDto, companyId });
  }

  @Get()
  @Roles('owner', 'staff', 'accountant')
  findByCompany(@CompanyContext() companyId: string) {
    return this.invoiceSettingsService.findByCompany(companyId);
  }

  @Patch()
  @Roles('owner')
  update(@Body() updateDto: UpdateInvoiceSettingDto, @CompanyContext() companyId: string) {
    return this.invoiceSettingsService.update(companyId, updateDto);
  }
}
