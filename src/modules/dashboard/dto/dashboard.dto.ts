import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class DashboardFilterDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}

export class DashboardStatsResponseDto {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalVatCollected: number;
  totalVatPaid: number;
  netVat: number;
  invoiceCount: number;
  paidInvoiceCount: number;
  pendingInvoiceCount: number;
  overdueInvoiceCount: number;
  expenseCount: number;
  currency: string;
}

export class RevenueVsExpenseChartDto {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export class VatChartDto {
  period: string;
  vatCollected: number;
  vatPaid: number;
  netVat: number;
}

export class TopExpenseCategoryDto {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  percentage: number;
}

export class DashboardResponseDto {
  stats: DashboardStatsResponseDto;
  revenueVsExpense: RevenueVsExpenseChartDto[];
  vatSummary: VatChartDto[];
  topExpenseCategories: TopExpenseCategoryDto[];
}