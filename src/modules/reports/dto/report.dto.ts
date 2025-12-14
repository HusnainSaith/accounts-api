import { IsDate, IsString, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  JSON = 'json',
}

export enum ReportType {
  VAT_SUMMARY = 'vat_summary',
  PROFIT_LOSS = 'profit_loss',
  BALANCE_SHEET = 'balance_sheet',
  CASH_FLOW = 'cash_flow',
}

export class ReportFilterDto {
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;
}

export class VatReportDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;
}

export class ProfitLossReportDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;
}

export class BalanceSheetReportDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @Type(() => Date)
  @IsDate()
  asOfDate: Date;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;
}

export class CashFlowReportDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @Type(() => Date)
  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;
}

export class ReportResponseDto {
  reportType: ReportType;
  generatedAt: Date;
  period: {
    startDate?: Date;
    endDate?: Date;
    asOfDate?: Date;
  };
  data: any;
  format: ReportFormat;
}