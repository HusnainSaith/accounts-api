import { Controller, Get, Post, Body, Patch, Param, UseGuards, UseInterceptors, Request, Query } from '@nestjs/common';
import { InvoicesService } from '../services/invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from '../dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CompanyGuard } from '../../../common/guards/company.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RLSInterceptor } from '../../../common/interceptors/rls.interceptor';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard, CompanyGuard)
@UseInterceptors(RLSInterceptor)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles('owner', 'staff', 'accountant')
  create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req: { user: { id: string } }) {
    return this.invoicesService.create(createInvoiceDto, req.user.id);
  }

  @Get()
  @Roles('owner', 'staff', 'accountant')
  findAll(@Query('status') status?: string) {
    return this.invoicesService.findAll(status);
  }

  @Get('statistics')
  @Roles('owner', 'staff', 'accountant')
  getStatistics() {
    return this.invoicesService.getStatistics();
  }

  @Get('generate-number')
  @Roles('owner', 'staff', 'accountant')
  generateInvoiceNumber() {
    return this.invoicesService.generateInvoiceNumber();
  }

  @Get(':id')
  @Roles('owner', 'staff', 'accountant')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Patch(':id')
  @Roles('owner', 'staff', 'accountant')
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, updateInvoiceDto);
  }

  @Patch(':id/send')
  @Roles('owner', 'staff')
  markAsSent(@Param('id') id: string) {
    return this.invoicesService.markAsSent(id);
  }

  @Patch(':id/paid')
  @Roles('owner', 'staff', 'accountant')
  markAsPaid(@Param('id') id: string) {
    return this.invoicesService.markAsPaid(id);
  }
}