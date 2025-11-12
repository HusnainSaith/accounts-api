import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { InvoiceItem } from '../../invoice-items/entities/invoice-item.entity';
import { CreateInvoiceDto, UpdateInvoiceDto } from '../dto';
import { CountriesService } from '../../countries/services/countries.service';
import { QrCodeService } from '../../qr-code/services/qr-code.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemsRepository: Repository<InvoiceItem>,
    private countriesService: CountriesService,
    private qrCodeService: QrCodeService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, companyId: string, userId: string): Promise<Invoice> {
    const { invoiceItems, ...invoiceData } = createInvoiceDto;
    
    // Generate invoice number if not provided
    if (!invoiceData.invoiceNumber) {
      invoiceData.invoiceNumber = await this.generateInvoiceNumber(companyId);
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
      companyId,
      subtotal,
      vatAmount,
      totalAmount,
      createdById: userId,
    });

    const savedInvoice = await this.invoicesRepository.save(invoice);

    // Create invoice items
    for (let i = 0; i < invoiceItems.length; i++) {
      const item = invoiceItems[i];
      const lineTotal = item.quantity * item.unitPrice * (1 - (item.discountPercentage || 0) / 100);
      const lineVatAmount = lineTotal * (item.vatRate / 100);

      await this.invoiceItemsRepository.save({
        invoiceId: savedInvoice.id,
        itemId: item.itemId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercentage: item.discountPercentage || 0,
        vatRate: item.vatRate,
        lineTotal,
        lineVatAmount,
        sortOrder: i + 1,
      });
    }

    return this.findOne(savedInvoice.id, savedInvoice.companyId);
  }

  async findAll(companyId: string, status?: string): Promise<Invoice[]> {
    const where: any = { companyId };
    
    if (status) {
      where.status = status;
    }

    return this.invoicesRepository.find({
      where,
      relations: ['customer', 'invoiceItems'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string, companyId: string): Promise<Invoice> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id, companyId },
      relations: ['customer', 'invoiceItems', 'createdBy', 'company']
    });
    
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    
    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto, companyId: string): Promise<Invoice> {
    await this.invoicesRepository.update({ id, companyId }, updateInvoiceDto);
    return this.findOne(id, companyId);
  }

  async markAsSent(id: string, companyId: string): Promise<Invoice> {
    await this.invoicesRepository.update({ id, companyId }, {
      status: InvoiceStatus.SENT
    });
    return this.findOne(id, companyId);
  }

  async markAsPaid(id: string, companyId: string): Promise<Invoice> {
    await this.invoicesRepository.update({ id, companyId }, {
      status: InvoiceStatus.PAID,
      paidAt: new Date()
    });
    return this.findOne(id, companyId);
  }

  async getStatistics(companyId: string): Promise<any> {
    const [total, draft, sent, paid, overdue] = await Promise.all([
      this.invoicesRepository.count({ where: { companyId } }),
      this.invoicesRepository.count({ where: { companyId, status: InvoiceStatus.DRAFT } }),
      this.invoicesRepository.count({ where: { companyId, status: InvoiceStatus.SENT } }),
      this.invoicesRepository.count({ where: { companyId, status: InvoiceStatus.PAID } }),
      this.invoicesRepository.count({ where: { companyId, status: InvoiceStatus.OVERDUE } })
    ]);

    const totalAmount = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .select('SUM(invoice.totalAmount)', 'sum')
      .where('invoice.companyId = :companyId', { companyId })
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

  async generateInvoiceNumber(companyId: string): Promise<string> {
    // Get company to extract first 3 characters of name
    const company = await this.invoicesRepository.manager
      .createQueryBuilder()
      .select('name')
      .from('companies', 'company')
      .where('company.id = :companyId', { companyId })
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
      .where('invoice.companyId = :companyId', { companyId })
      .andWhere('invoice.invoiceNumber LIKE :prefix', { prefix: `${todayPrefix}%` })
      .orderBy('invoice.invoiceNumber', 'DESC')
      .getOne();
    
    let sequenceNumber = 1;
    if (lastInvoice) {
      const lastSequence = lastInvoice.invoiceNumber.split('-').pop();
      sequenceNumber = parseInt(lastSequence || '0') + 1;
    }
    
    return `${todayPrefix}${String(sequenceNumber).padStart(4, '0')}`;
  }

  async generateQRCode(invoice: Invoice): Promise<string | null> {
    const invoiceWithCompany = await this.invoicesRepository.findOne({
      where: { id: invoice.id },
      relations: ['company']
    });

    if (!invoiceWithCompany?.company) {
      return null;
    }

    if (invoiceWithCompany.company.countryCode === 'SA') {
      return this.qrCodeService.generateZATCAQRCode({
        sellerName: invoiceWithCompany.company.name,
        vatNumber: invoiceWithCompany.company.trn || '',
        timestamp: invoice.createdAt.toISOString(),
        invoiceTotal: invoice.totalAmount,
        vatAmount: invoice.vatAmount,
      });
    }

    return this.qrCodeService.generateSimpleQRCode(
      `Invoice: ${invoice.invoiceNumber}\nAmount: ${invoice.totalAmount}\nDate: ${invoice.createdAt.toDateString()}`
    );
  }
}