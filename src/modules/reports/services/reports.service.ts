import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Invoice, InvoiceStatus } from '../../invoices/entities/invoice.entity';
<<<<<<< HEAD
import { Customer } from '../../customers/entities/customer.entity';
import { Expense } from '../../expenses/entities/expense.entity';
=======
import { Constant, ConstantType } from '../../constant/entities/constant.entity';
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
import { VatReportDto, ProfitLossReportDto, BalanceSheetReportDto, CashFlowReportDto } from '../dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
<<<<<<< HEAD
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
=======
    @InjectRepository(Constant)
    private constantsRepository: Repository<Constant>,
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
  ) {}

  async generateVatReport(vatReportDto: VatReportDto) {
    this.validateDateRange(vatReportDto.startDate, vatReportDto.endDate);

    const invoices = await this.invoicesRepository.find({
      where: {
        companyId: vatReportDto.companyId,
        createdAt: Between(vatReportDto.startDate, vatReportDto.endDate)
      },
      relations: ['party'],
      order: { createdAt: 'ASC' }
    });

    const paidInvoices = invoices.filter(inv => inv.status === InvoiceStatus.PAID);
    const totalSales = paidInvoices.reduce((sum, inv) => sum + Number(inv.subtotal), 0);
    const totalVat = paidInvoices.reduce((sum, inv) => sum + Number(inv.vatAmount), 0);
    const totalGross = paidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    return {
      period: { start: vatReportDto.startDate, end: vatReportDto.endDate },
      summary: {
        totalSales,
        totalVat,
        totalGross,
        invoiceCount: paidInvoices.length,
        averageInvoiceValue: paidInvoices.length > 0 ? totalGross / paidInvoices.length : 0
      },
      invoices: paidInvoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: inv.createdAt,
        customer: (inv.party as any)?.name || 'Unknown',
        subtotal: Number(inv.subtotal),
        vatAmount: Number(inv.vatAmount),
        total: Number(inv.totalAmount)
      }))
    };
  }

  async generateProfitLossReport(profitLossDto: ProfitLossReportDto) {
    this.validateDateRange(profitLossDto.startDate, profitLossDto.endDate);

    const [paidInvoices, allInvoices, expenses] = await Promise.all([
      this.invoicesRepository.find({
        where: {
          companyId: profitLossDto.companyId,
          createdAt: Between(profitLossDto.startDate, profitLossDto.endDate),
          status: InvoiceStatus.PAID
        }
      }),
      this.invoicesRepository.find({
        where: {
          companyId: profitLossDto.companyId,
          createdAt: Between(profitLossDto.startDate, profitLossDto.endDate)
        }
      }),
      this.expensesRepository.find({
        where: {
          companyId: profitLossDto.companyId,
          expenseDate: Between(profitLossDto.startDate, profitLossDto.endDate)
        }
      })
    ]);

    const revenue = paidInvoices.reduce((sum, inv) => sum + Number(inv.subtotal), 0);
    const vatCollected = paidInvoices.reduce((sum, inv) => sum + Number(inv.vatAmount), 0);
    const totalInvoiced = allInvoices.reduce((sum, inv) => sum + Number(inv.subtotal), 0);
<<<<<<< HEAD
    const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    const vatPaid = expenses.reduce((sum, exp) => sum + Number(exp.vatAmount || 0), 0);
=======
    const totalExpenses = 0; // Expenses module not available
    const vatPaid = 0; // Expenses module not available
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
    const netProfit = revenue - totalExpenses;

    return {
      period: { start: profitLossDto.startDate, end: profitLossDto.endDate },
      income: {
        revenue,
        totalInvoiced,
        collectionRate: totalInvoiced > 0 ? (revenue / totalInvoiced) * 100 : 0
      },
      expenses: {
        total: totalExpenses,
        vatPaid,
<<<<<<< HEAD
        count: expenses.length
=======
        count: 0
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
      },
      profitLoss: {
        grossProfit: revenue,
        netProfit,
        profitMargin: revenue > 0 ? (netProfit / revenue) * 100 : 0
      },
      taxes: {
        vatCollected,
        vatPaid,
        netVat: vatCollected - vatPaid
      }
    };
  }

  async generateBalanceSheet(balanceSheetDto: BalanceSheetReportDto) {
    const paidInvoices = await this.invoicesRepository.find({
      where: {
        companyId: balanceSheetDto.companyId,
        status: InvoiceStatus.PAID
      }
    });

    const unpaidInvoices = await this.invoicesRepository.find({
      where: {
        companyId: balanceSheetDto.companyId,
        status: InvoiceStatus.SENT
      }
    });

    const cash = paidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const accountsReceivable = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    return {
      asOfDate: balanceSheetDto.asOfDate,
      assets: {
        currentAssets: {
          cash,
          accountsReceivable,
          total: cash + accountsReceivable
        }
      },
      liabilities: {
        currentLiabilities: {
          vatPayable: paidInvoices.reduce((sum, inv) => sum + Number(inv.vatAmount), 0)
        }
      },
      equity: {
        retainedEarnings: cash - paidInvoices.reduce((sum, inv) => sum + Number(inv.vatAmount), 0)
      }
    };
  }

  async generateCashFlowReport(cashFlowDto: CashFlowReportDto) {
    const invoices = await this.invoicesRepository.find({
      where: {
        companyId: cashFlowDto.companyId,
        paidAt: Between(cashFlowDto.startDate, cashFlowDto.endDate)
      }
    });

    const operatingCashFlow = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    return {
      period: { start: cashFlowDto.startDate, end: cashFlowDto.endDate },
      operatingActivities: {
        cashFromCustomers: operatingCashFlow,
        netCashFromOperating: operatingCashFlow
      },
      investingActivities: {
        netCashFromInvesting: 0
      },
      financingActivities: {
        netCashFromFinancing: 0
      },
      netCashFlow: operatingCashFlow
    };
  }

  async generateCustomerReport(companyId: string, startDate: Date, endDate: Date) {
    this.validateDateRange(startDate, endDate);

    const customers = await this.constantsRepository.find({
      where: { companyId, type: ConstantType.CUSTOMER },
      relations: ['invoices']
    });

    const customerData = await Promise.all(
      customers.map(async (customer) => {
        const invoices = await this.invoicesRepository.find({
          where: {
            partyId: customer.id,
            createdAt: Between(startDate, endDate)
          }
        });

        const paidInvoices = invoices.filter(inv => inv.status === InvoiceStatus.PAID);
        const totalSpent = paidInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
        const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

        return {
          customerId: customer.id,
          customerName: customer.name,
          customerType: customer.type,
          totalInvoices: invoices.length,
          paidInvoices: paidInvoices.length,
          totalInvoiced,
          totalPaid: totalSpent,
          outstandingAmount: totalInvoiced - totalSpent,
          paymentRate: totalInvoiced > 0 ? (totalSpent / totalInvoiced) * 100 : 0
        };
      })
    );

    return {
      period: { start: startDate, end: endDate },
      customers: customerData.sort((a, b) => b.totalPaid - a.totalPaid),
      summary: {
        totalCustomers: customers.length,
        activeCustomers: customerData.filter(c => c.totalInvoices > 0).length,
        totalRevenue: customerData.reduce((sum, c) => sum + c.totalPaid, 0),
        totalOutstanding: customerData.reduce((sum, c) => sum + c.outstandingAmount, 0)
      }
    };
  }

  async getDashboardChartData(companyId: string, months: number = 6): Promise<any[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

<<<<<<< HEAD
    const [invoices, expenses] = await Promise.all([
      this.invoicesRepository
        .createQueryBuilder('invoice')
        .select('DATE_TRUNC(\'month\', invoice.createdAt)', 'month')
        .addSelect('SUM(invoice.subtotal)', 'revenue')
        .addSelect('SUM(invoice.vatAmount)', 'vat')
        .addSelect('COUNT(invoice.id)', 'count')
        .where('invoice.companyId = :companyId', { companyId })
        .andWhere('invoice.status = :status', { status: InvoiceStatus.PAID })
        .andWhere('invoice.createdAt >= :startDate', { startDate })
        .groupBy('DATE_TRUNC(\'month\', invoice.createdAt)')
        .orderBy('month', 'ASC')
        .getRawMany(),
      this.expensesRepository
        .createQueryBuilder('expense')
        .select('DATE_TRUNC(\'month\', expense.expenseDate)', 'month')
        .addSelect('SUM(expense.amount)', 'total')
        .addSelect('COUNT(expense.id)', 'count')
        .where('expense.companyId = :companyId', { companyId })
        .andWhere('expense.expenseDate >= :startDate', { startDate })
        .groupBy('DATE_TRUNC(\'month\', expense.expenseDate)')
        .orderBy('month', 'ASC')
        .getRawMany(),
    ]);
=======
    const invoices = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .select('DATE_TRUNC(\'month\', invoice.createdAt)', 'month')
      .addSelect('SUM(invoice.subtotal)', 'revenue')
      .addSelect('SUM(invoice.vatAmount)', 'vat')
      .addSelect('COUNT(invoice.id)', 'count')
      .where('invoice.companyId = :companyId', { companyId })
      .andWhere('invoice.status = :status', { status: InvoiceStatus.PAID })
      .andWhere('invoice.createdAt >= :startDate', { startDate })
      .groupBy('DATE_TRUNC(\'month\', invoice.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();
    
    const expenses: any[] = []; // Expenses module not available
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f

    const chartData: any[] = [];
    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (months - i - 1));
      const monthKey = date.toISOString().substring(0, 7);

      const invoiceData = invoices.find((inv) => inv.month?.substring(0, 7) === monthKey);
<<<<<<< HEAD
      const expenseData = expenses.find((exp) => exp.month?.substring(0, 7) === monthKey);
=======
      const expenseData = null; // Expenses module not available
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f

      chartData.push({
        month: monthKey,
        revenue: Number(invoiceData?.revenue || 0),
<<<<<<< HEAD
        expenses: Number(expenseData?.total || 0),
        netProfit: Number(invoiceData?.revenue || 0) - Number(expenseData?.total || 0),
        vat: Number(invoiceData?.vat || 0),
        invoiceCount: Number(invoiceData?.count || 0),
        expenseCount: Number(expenseData?.count || 0),
=======
        expenses: 0,
        netProfit: Number(invoiceData?.revenue || 0),
        vat: Number(invoiceData?.vat || 0),
        invoiceCount: Number(invoiceData?.count || 0),
        expenseCount: 0,
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
      });
    }

    return chartData;
  }

  async getExpensesByCategory(companyId: string, startDate: Date, endDate: Date) {
<<<<<<< HEAD
    return this.expensesRepository
      .createQueryBuilder('expense')
      .select('category.name_en', 'categoryName')
      .addSelect('category.name_ar', 'categoryNameAr')
      .addSelect('SUM(expense.amount)', 'totalAmount')
      .addSelect('COUNT(expense.id)', 'count')
      .leftJoin('expense.category', 'category')
      .where('expense.companyId = :companyId', { companyId })
      .andWhere('expense.expenseDate BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('category.id')
      .addGroupBy('category.name_en')
      .addGroupBy('category.name_ar')
      .orderBy('totalAmount', 'DESC')
      .getRawMany();
=======
    // Expenses module not available
    return [];
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
  }

  private validateDateRange(startDate: Date, endDate: Date) {
    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }
    
    const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
    if (endDate.getTime() - startDate.getTime() > maxRange) {
      throw new BadRequestException('Date range cannot exceed 1 year');
    }
  }
}