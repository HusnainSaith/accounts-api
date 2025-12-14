import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExcelExportService {
  async exportVatReport(data: any, language: 'en' | 'ar' = 'en'): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(language === 'ar' ? 'تقرير ضريبة القيمة المضافة' : 'VAT Report');

    // Set RTL for Arabic
    if (language === 'ar') {
      worksheet.views = [{ rightToLeft: true }];
    }

    const labels = this.getLabels(language);

    // Title
    worksheet.mergeCells('A1:G1');
    worksheet.getCell('A1').value = labels.vatReport;
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Period
    worksheet.mergeCells('A2:G2');
    worksheet.getCell('A2').value = `${labels.period}: ${data.period.start} - ${data.period.end}`;

    // Summary
    worksheet.addRow([]);
    worksheet.addRow([labels.summary]);
    worksheet.addRow([labels.totalSales, data.summary.totalSales]);
    worksheet.addRow([labels.totalVat, data.summary.totalVat]);
    worksheet.addRow([labels.totalGross, data.summary.totalGross]);
    worksheet.addRow([labels.invoiceCount, data.summary.invoiceCount]);

    // Invoice details
    worksheet.addRow([]);
    const headerRow = worksheet.addRow([
      labels.invoiceNumber,
      labels.date,
      labels.customer,
      labels.subtotal,
      labels.vat,
      labels.total,
    ]);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

    data.invoices.forEach((inv: any) => {
      worksheet.addRow([
        inv.invoiceNumber,
        new Date(inv.date).toLocaleDateString(),
        inv.customer,
        inv.subtotal,
        inv.vatAmount,
        inv.total,
      ]);
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = 15;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportProfitLoss(data: any, language: 'en' | 'ar' = 'en'): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(language === 'ar' ? 'الأرباح والخسائر' : 'Profit & Loss');

    if (language === 'ar') {
      worksheet.views = [{ rightToLeft: true }];
    }

    const labels = this.getLabels(language);

    worksheet.mergeCells('A1:C1');
    worksheet.getCell('A1').value = labels.profitLoss;
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:C2');
    worksheet.getCell('A2').value = `${labels.period}: ${data.period.start} - ${data.period.end}`;

    worksheet.addRow([]);
    worksheet.addRow([labels.income]).font = { bold: true };
    worksheet.addRow([labels.revenue, data.income.revenue]);
    worksheet.addRow([labels.totalInvoiced, data.income.totalInvoiced]);

    worksheet.addRow([]);
    worksheet.addRow([labels.expenses]).font = { bold: true };
    worksheet.addRow([labels.totalExpenses, data.expenses.total]);

    worksheet.addRow([]);
    worksheet.addRow([labels.profitLoss]).font = { bold: true };
    worksheet.addRow([labels.grossProfit, data.profitLoss.grossProfit]);
    worksheet.addRow([labels.netProfit, data.profitLoss.netProfit]);

    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportBalanceSheet(data: any, language: 'en' | 'ar' = 'en'): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(language === 'ar' ? 'الميزانية العمومية' : 'Balance Sheet');

    if (language === 'ar') {
      worksheet.views = [{ rightToLeft: true }];
    }

    const labels = this.getLabels(language);

    worksheet.mergeCells('A1:C1');
    worksheet.getCell('A1').value = labels.balanceSheet;
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.addRow([]);
    worksheet.addRow([labels.assets]).font = { bold: true };
    worksheet.addRow([labels.cash, data.assets.currentAssets.cash]);
    worksheet.addRow([labels.accountsReceivable, data.assets.currentAssets.accountsReceivable]);
    worksheet.addRow([labels.totalAssets, data.assets.currentAssets.total]);

    worksheet.addRow([]);
    worksheet.addRow([labels.liabilities]).font = { bold: true };
    worksheet.addRow([labels.vatPayable, data.liabilities.currentLiabilities.vatPayable]);

    worksheet.addRow([]);
    worksheet.addRow([labels.equity]).font = { bold: true };
    worksheet.addRow([labels.retainedEarnings, data.equity.retainedEarnings]);

    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportExpensesByCategory(data: any[], language: 'en' | 'ar' = 'en'): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(language === 'ar' ? 'المصروفات حسب الفئة' : 'Expenses by Category');

    if (language === 'ar') {
      worksheet.views = [{ rightToLeft: true }];
    }

    const labels = this.getLabels(language);

    worksheet.mergeCells('A1:D1');
    worksheet.getCell('A1').value = language === 'ar' ? 'المصروفات حسب الفئة' : 'Expenses by Category';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.addRow([]);
    const headerRow = worksheet.addRow([
      labels.category,
      labels.totalAmount,
      labels.count,
    ]);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };

    data.forEach((item) => {
      worksheet.addRow([
        language === 'ar' ? item.categoryNameAr : item.categoryName,
        item.totalAmount,
        item.count,
      ]);
    });

    worksheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private getLabels(language: 'en' | 'ar') {
    if (language === 'ar') {
      return {
        vatReport: 'تقرير ضريبة القيمة المضافة',
        profitLoss: 'الأرباح والخسائر',
        balanceSheet: 'الميزانية العمومية',
        period: 'الفترة',
        summary: 'الملخص',
        totalSales: 'إجمالي المبيعات',
        totalVat: 'إجمالي ضريبة القيمة المضافة',
        totalGross: 'الإجمالي الكلي',
        invoiceCount: 'عدد الفواتير',
        invoiceNumber: 'رقم الفاتورة',
        date: 'التاريخ',
        customer: 'العميل',
        subtotal: 'المجموع الفرعي',
        vat: 'ضريبة القيمة المضافة',
        total: 'المجموع',
        income: 'الإيرادات',
        revenue: 'الإيرادات',
        totalInvoiced: 'إجمالي الفواتير',
        expenses: 'المصروفات',
        totalExpenses: 'إجمالي المصروفات',
        grossProfit: 'إجمالي الربح',
        netProfit: 'صافي الربح',
        assets: 'الأصول',
        cash: 'النقدية',
        accountsReceivable: 'الذمم المدينة',
        totalAssets: 'إجمالي الأصول',
        liabilities: 'الخصوم',
        vatPayable: 'ضريبة القيمة المضافة المستحقة',
        equity: 'حقوق الملكية',
        retainedEarnings: 'الأرباح المحتجزة',
        category: 'الفئة',
        totalAmount: 'المبلغ الإجمالي',
        count: 'العدد',
      };
    }

    return {
      vatReport: 'VAT Report',
      profitLoss: 'Profit & Loss',
      balanceSheet: 'Balance Sheet',
      period: 'Period',
      summary: 'Summary',
      totalSales: 'Total Sales',
      totalVat: 'Total VAT',
      totalGross: 'Total Gross',
      invoiceCount: 'Invoice Count',
      invoiceNumber: 'Invoice Number',
      date: 'Date',
      customer: 'Customer',
      subtotal: 'Subtotal',
      vat: 'VAT',
      total: 'Total',
      income: 'Income',
      revenue: 'Revenue',
      totalInvoiced: 'Total Invoiced',
      expenses: 'Expenses',
      totalExpenses: 'Total Expenses',
      grossProfit: 'Gross Profit',
      netProfit: 'Net Profit',
      assets: 'Assets',
      cash: 'Cash',
      accountsReceivable: 'Accounts Receivable',
      totalAssets: 'Total Assets',
      liabilities: 'Liabilities',
      vatPayable: 'VAT Payable',
      equity: 'Equity',
      retainedEarnings: 'Retained Earnings',
      category: 'Category',
      totalAmount: 'Total Amount',
      count: 'Count',
    };
  }
}
