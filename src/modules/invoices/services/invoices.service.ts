import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus, InvoiceType } from '../entities/invoice.entity';

import { CreateInvoiceDto, UpdateInvoiceDto } from '../dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    const { invoiceItems, ...invoiceData } = createInvoiceDto;
    
    // Generate invoice number if not provided
    if (!invoiceData.invoiceNumber) {
      invoiceData.invoiceNumber = await this.generateInvoiceNumber();
    }
    
    // Calculate totals
    let subtotal = 0;
    let vatAmount = 0;
    
    for (const item of invoiceItems) {
      const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercentage || 0) / 100);
      const lineVat = lineTotal * (item.vatRate / 100);
      subtotal += lineTotal;
      vatAmount += lineVat;
    }

    const totalAmount = subtotal + vatAmount - (createInvoiceDto.discountAmount || 0);

    const invoice = this.invoicesRepository.create({
      ...invoiceData,
      subtotal,
      taxAmount: vatAmount,
      totalAmount,
      createdBy: userId,
      invoiceType: InvoiceType.SALES as any, // Default to sales
      invoiceNo: invoiceData.invoiceNumber,
      invoiceDate: new Date(),
      dueDate: invoiceData.dueDate || new Date(),
      currencyCode: 'AED', // Default currency
    });

    const savedInvoice = await this.invoicesRepository.save(invoice);

    // Invoice items creation would be handled separately

    return this.findOne(savedInvoice.id);
  }

  async findAll(status?: string): Promise<Invoice[]> {
    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    // RLS will automatically filter by current tenant
    return this.invoicesRepository.find({
      where,
      relations: ['customer', 'invoiceItems'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Invoice> {
    // RLS will automatically filter by current tenant
    const invoice = await this.invoicesRepository.findOne({
      where: { id },
      relations: ['customer', 'invoiceItems', 'createdBy', 'company']
    });
    
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    
    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice> {
    // RLS will automatically filter by current tenant
    await this.invoicesRepository.update({ id }, updateInvoiceDto);
    return this.findOne(id);
  }

  async markAsSent(id: string): Promise<Invoice> {
    // RLS will automatically filter by current tenant
    await this.invoicesRepository.update({ id }, {
      status: InvoiceStatus.SENT
    });
    return this.findOne(id);
  }

  async markAsPaid(id: string): Promise<Invoice> {
    // RLS will automatically filter by current tenant
    await this.invoicesRepository.update({ id }, {
      status: InvoiceStatus.PAID,
      paidAt: new Date()
    });
    return this.findOne(id);
  }

  async getStatistics(): Promise<any> {
    // RLS will automatically filter by current tenant
    const [total, draft, sent, paid, overdue] = await Promise.all([
      this.invoicesRepository.count(),
      this.invoicesRepository.count({ where: { status: InvoiceStatus.DRAFT } }),
      this.invoicesRepository.count({ where: { status: InvoiceStatus.SENT } }),
      this.invoicesRepository.count({ where: { status: InvoiceStatus.PAID } }),
      this.invoicesRepository.count({ where: { status: InvoiceStatus.OVERDUE } })
    ]);

    const totalAmount = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.totalAmount)', 'sum')
      .getRawOne();

    return { 
      total, 
      draft, 
      sent, 
      paid, 
      overdue,
      totalAmount: parseFloat(totalAmount.sum) || 0
    };
  }

  async generateInvoiceNumber(): Promise<string> {
    // Get company to extract first 3 characters of name
    const company = await this.invoicesRepository.manager
      .createQueryBuilder()
      .select('name')
      .from('companies', 'company')
      .getRawOne();
    
    const companyPrefix = company?.name?.substring(0, 3).toUpperCase() || 'INV';
    
    // Get current date in MM-DD format
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    // Find the highest sequence number for today's invoices with this prefix
    const todayPrefix = `${companyPrefix}-${month}-${day}-`;
    
    const lastInvoice = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .where('invoice.invoiceNumber LIKE :prefix', { prefix: `${todayPrefix}%` })
      .orderBy('invoice.invoiceNumber', 'DESC')
      .getOne();
    
    let sequenceNumber = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const lastSequence = lastInvoice.invoiceNumber.split('-').pop();
      sequenceNumber = parseInt(lastSequence || '0') + 1;
    }
    
    return `${todayPrefix}${String(sequenceNumber).padStart(4, '0')}`;
  }

  async generateQRCode(invoice: Invoice): Promise<string | null> {
    // QR Code generation functionality removed - service not available
    return null;
  }
}