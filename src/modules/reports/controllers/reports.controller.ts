import { Controller, Get, Query, UseGuards, Res, Header } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from '../services/reports.service';
import { ExcelExportService } from '../services/excel-export.service';
import { VatReportDto, ProfitLossReportDto, BalanceSheetReportDto, CashFlowReportDto } from '../dto/report.dto';
import { RequirePermissions } from '../../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly excelExportService: ExcelExportService,
  ) {}

  @Get('vat')
  @RequirePermissions('reports.view')
  generateVatReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CompanyContext() companyId: string
  ) {
    return this.reportsService.generateVatReport({
      companyId,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
  }

  @Get('profit-loss')
  @RequirePermissions('reports.view')
  generateProfitLossReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CompanyContext() companyId: string
  ) {
    return this.reportsService.generateProfitLossReport({
      companyId,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
  }

  @Get('balance-sheet')
  @RequirePermissions('reports.view')
  generateBalanceSheet(
    @Query('asOfDate') asOfDate: string,
    @CompanyContext() companyId: string
  ) {
    return this.reportsService.generateBalanceSheet({
      companyId,
      asOfDate: new Date(asOfDate)
    });
  }

  @Get('cash-flow')
  @RequirePermissions('reports.view')
  generateCashFlowReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CompanyContext() companyId: string
  ) {
    return this.reportsService.generateCashFlowReport({
      companyId,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
  }

  @Get('customers')
  @RequirePermissions('reports.view')
  generateCustomerReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CompanyContext() companyId: string
  ) {
    return this.reportsService.generateCustomerReport(
      companyId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('dashboard/charts')
  @RequirePermissions('reports.view')
  getDashboardCharts(
    @Query('months') months: string,
    @CompanyContext() companyId: string
  ) {
    return this.reportsService.getDashboardChartData(
      companyId,
      months ? parseInt(months) : 6
    );
  }

  @Get('expenses/by-category')
  @RequirePermissions('reports.view')
  getExpensesByCategory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CompanyContext() companyId: string
  ) {
    return this.reportsService.getExpensesByCategory(
      companyId,
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('vat/export/excel')
  @RequirePermissions('reports.view')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportVatReportExcel(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('language') language: string,
    @CompanyContext() companyId: string,
    @Res() res: Response
  ) {
    const data = await this.reportsService.generateVatReport({
      companyId,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
    const buffer = await this.excelExportService.exportVatReport(data, language as 'en' | 'ar');
    res.setHeader('Content-Disposition', `attachment; filename=vat-report-${startDate}-${endDate}.xlsx`);
    res.send(buffer);
  }

  @Get('profit-loss/export/excel')
  @RequirePermissions('reports.view')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportProfitLossExcel(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('language') language: string,
    @CompanyContext() companyId: string,
    @Res() res: Response
  ) {
    const data = await this.reportsService.generateProfitLossReport({
      companyId,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
    const buffer = await this.excelExportService.exportProfitLoss(data, language as 'en' | 'ar');
    res.setHeader('Content-Disposition', `attachment; filename=profit-loss-${startDate}-${endDate}.xlsx`);
    res.send(buffer);
  }

  @Get('balance-sheet/export/excel')
  @RequirePermissions('reports.view')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportBalanceSheetExcel(
    @Query('asOfDate') asOfDate: string,
    @Query('language') language: string,
    @CompanyContext() companyId: string,
    @Res() res: Response
  ) {
    const data = await this.reportsService.generateBalanceSheet({
      companyId,
      asOfDate: new Date(asOfDate)
    });
    const buffer = await this.excelExportService.exportBalanceSheet(data, language as 'en' | 'ar');
    res.setHeader('Content-Disposition', `attachment; filename=balance-sheet-${asOfDate}.xlsx`);
    res.send(buffer);
  }

  @Get('expenses/by-category/export/excel')
  @RequirePermissions('reports.view')
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  async exportExpensesByCategoryExcel(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('language') language: string,
    @CompanyContext() companyId: string,
    @Res() res: Response
  ) {
    const data = await this.reportsService.getExpensesByCategory(
      companyId,
      new Date(startDate),
      new Date(endDate)
    );
    const buffer = await this.excelExportService.exportExpensesByCategory(data, language as 'en' | 'ar');
    res.setHeader('Content-Disposition', `attachment; filename=expenses-by-category-${startDate}-${endDate}.xlsx`);
    res.send(buffer);
  }
}