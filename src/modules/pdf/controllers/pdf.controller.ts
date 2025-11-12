import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';
import { PdfService } from '../services/pdf.service';
import { InvoicesService } from '../../invoices/services/invoices.service';
import { FileUploadService } from '../../file-upload/services/file-upload.service';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CompanyGuard } from '../../../common/guards/company.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RLSInterceptor } from '../../../common/interceptors/rls.interceptor';

@Controller('pdf')
@UseGuards(JwtAuthGuard, RolesGuard, CompanyGuard)
@UseInterceptors(RLSInterceptor)
export class PdfController {
  constructor(
    private readonly pdfService: PdfService,
    private readonly invoicesService: InvoicesService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Get('invoice/:id')
  @Roles('owner', 'staff', 'accountant')
  async generateInvoicePDF(
    @Param('id') invoiceId: string,
    @Query('lang') language: 'en' | 'ar' = 'en',
    @CompanyContext() companyId: string,
  ) {
    const invoice = await this.invoicesService.findOne(invoiceId, companyId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const pdfBuffer = await this.pdfService.generateInvoicePDF(
      invoice,
      language,
    );

    // Upload to S3 and update invoice
    const pdfUrl = await this.fileUploadService.uploadInvoicePDF(
      pdfBuffer,
      invoice.invoiceNumber,
      invoice.companyId,
    );

    await this.invoicesService.update(invoiceId, { pdfPath: pdfUrl }, companyId);

    return {
      success: true,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      pdfUrl,
      pdfSize: pdfBuffer.length,
      language,
      generatedAt: new Date().toISOString(),
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceType: invoice.invoiceType,
        status: invoice.status,
        dueDate: invoice.dueDate,
        supplyDate: invoice.supplyDate,
        subtotal: invoice.subtotal,
        vatRate: invoice.vatRate,
        vatAmount: invoice.vatAmount,
        discountAmount: invoice.discountAmount,
        totalAmount: invoice.totalAmount,
        currencyCode: invoice.currencyCode,
        notes: invoice.notes,
        paymentMethod: invoice.paymentMethod,
        createdAt: invoice.createdAt,
        company: invoice.company,
        customer: invoice.customer,
        invoiceItems: invoice.invoiceItems
      }
    };
  }
}
