import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Invoice, InvoiceStatus } from '../../invoices/entities/invoice.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Item } from '../../items/entities/item.entity';
import { Expense } from '../../expenses/entities/expense.entity';
import { VatReport, VatReportStatus } from '../../vat-reports/entities/vat-report.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRepository(Item)
    private itemsRepository: Repository<Item>,
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    @InjectRepository(VatReport)
    private vatReportsRepository: Repository<VatReport>,
  ) {}

  async getDashboardStats(companyId: string) {
    const [
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalCustomers,
      totalItems,
      totalExpenses,
      recentInvoices
    ] = await Promise.all([
      this.invoicesRepository.count({ where: { companyId } }),
      this.invoicesRepository.count({ where: { companyId, status: InvoiceStatus.PAID } }),
      this.invoicesRepository.count({ where: { companyId, status: InvoiceStatus.SENT } }),
      this.customersRepository.count({ where: { companyId } }),
      this.itemsRepository.count({ where: { companyId, isActive: true } }),
      this.expensesRepository.count({ where: { companyId } }),
      this.invoicesRepository.find({
        where: { companyId },
        relations: ['customer'],
        order: { createdAt: 'DESC' },
        take: 5
      })
    ]);

    const totalRevenue = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.totalAmount)', 'total')
      .where('invoice.companyId = :companyId', { companyId })
      .andWhere('invoice.status = :status', { status: InvoiceStatus.PAID })
      .getRawOne();

    const [monthlyRevenue, monthlyExpenses] = await Promise.all([
      this.invoicesRepository
        .createQueryBuilder('invoice')
        .select('SUM(invoice.totalAmount)', 'total')
        .where('invoice.companyId = :companyId', { companyId })
        .andWhere('invoice.status = :status', { status: InvoiceStatus.PAID })
        .andWhere('invoice.paidAt >= :startOfMonth', { 
          startOfMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
        })
        .getRawOne(),
      this.expensesRepository
        .createQueryBuilder('expense')
        .select('SUM(expense.amount)', 'total')
        .where('expense.companyId = :companyId', { companyId })
        .andWhere('expense.expenseDate >= :startOfMonth', { 
          startOfMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
        })
        .getRawOne()
    ]);

    const totalRevenueNum = Number(totalRevenue?.total || 0);
    const monthlyRevenueNum = Number(monthlyRevenue?.total || 0);
    const monthlyExpensesNum = Number(monthlyExpenses?.total || 0);

    return {
      stats: {
        totalInvoices,
        paidInvoices,
        pendingInvoices,
        totalCustomers,
        totalItems,
        totalExpenses,
        totalRevenue: totalRevenueNum,
        monthlyRevenue: monthlyRevenueNum,
        monthlyExpenses: monthlyExpensesNum,
        monthlyNetProfit: monthlyRevenueNum - monthlyExpensesNum
      },
      recentInvoices: recentInvoices.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customer?.name,
        totalAmount: invoice.totalAmount,
        status: invoice.status,
        createdAt: invoice.createdAt
      }))
    };
  }

  async getMonthlyRevenueChart(companyId: string) {
    const months: { month: string; revenue: number; expenses: number; netProfit: number }[] = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      
      const [revenue, expenses] = await Promise.all([
        this.invoicesRepository
          .createQueryBuilder('invoice')
          .select('SUM(invoice.totalAmount)', 'total')
          .where('invoice.companyId = :companyId', { companyId })
          .andWhere('invoice.status = :status', { status: InvoiceStatus.PAID })
          .andWhere('invoice.paidAt >= :startDate', { startDate: date })
          .andWhere('invoice.paidAt < :endDate', { endDate: nextMonth })
          .getRawOne(),
        this.expensesRepository
          .createQueryBuilder('expense')
          .select('SUM(expense.amount)', 'total')
          .where('expense.companyId = :companyId', { companyId })
          .andWhere('expense.expenseDate >= :startDate', { startDate: date })
          .andWhere('expense.expenseDate < :endDate', { endDate: nextMonth })
          .getRawOne()
      ]);

      const revenueNum = Number(revenue?.total || 0);
      const expensesNum = Number(expenses?.total || 0);

      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: revenueNum,
        expenses: expensesNum,
        netProfit: revenueNum - expensesNum
      });
    }

    return months;
  }

  async getTopCustomers(companyId: string, limit = 5) {
    const topCustomers = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .leftJoin('invoice.customer', 'customer')
      .select('customer.id', 'customerId')
      .addSelect('customer.nameEn', 'customerName')
      .addSelect('SUM(invoice.totalAmount)', 'totalSpent')
      .addSelect('COUNT(invoice.id)', 'invoiceCount')
      .where('invoice.companyId = :companyId', { companyId })
      .andWhere('invoice.status = :status', { status: InvoiceStatus.PAID })
      .groupBy('customer.id')
      .orderBy('totalSpent', 'DESC')
      .limit(limit)
      .getRawMany();

    return topCustomers.map(customer => ({
      customerId: customer.customerId,
      customerName: customer.customerName,
      totalSpent: Number(customer.totalSpent),
      invoiceCount: Number(customer.invoiceCount)
    }));
  }

  async getOverdueInvoices(companyId: string) {
    const overdueInvoices = await this.invoicesRepository.find({
      where: {
        companyId,
        status: InvoiceStatus.SENT,
        dueDate: Between(new Date('1900-01-01'), new Date())
      },
      relations: ['customer'],
      order: { dueDate: 'ASC' },
      take: 10
    });

    return overdueInvoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customer?.name,
      totalAmount: invoice.totalAmount,
      dueDate: invoice.dueDate,
      daysPastDue: Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    }));
  }

  async getRecentActivity(companyId: string, limit = 10) {
    const recentInvoices = await this.invoicesRepository.find({
      where: { companyId },
      relations: ['customer', 'createdBy'],
      order: { createdAt: 'DESC' },
      take: limit
    });

    return recentInvoices.map(invoice => ({
      type: 'invoice',
      action: 'created',
      description: `Invoice ${invoice.invoiceNumber} created for ${invoice.customer?.name}`,
      amount: invoice.totalAmount,
      createdAt: invoice.createdAt,
      createdBy: invoice.createdBy?.firstName + ' ' + invoice.createdBy?.lastName
    }));
  }

  async getVatSummary(companyId: string) {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const [totalVatCollected, pendingVatReports] = await Promise.all([
      this.invoicesRepository
        .createQueryBuilder('invoice')
        .select('SUM(invoice.vatAmount)', 'total')
        .where('invoice.companyId = :companyId', { companyId })
        .andWhere('invoice.status = :status', { status: InvoiceStatus.PAID })
        .andWhere('invoice.paidAt BETWEEN :start AND :end', { start: startOfYear, end: endOfYear })
        .getRawOne(),
      this.vatReportsRepository.count({
        where: {
          companyId,
          reportStatus: VatReportStatus.DRAFT
        }
      })
    ]);

    return {
      totalVatCollected: Number(totalVatCollected?.total || 0),
      pendingVatReports
    };
  }
}