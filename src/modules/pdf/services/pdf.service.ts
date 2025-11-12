import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { Invoice } from '../../invoices/entities/invoice.entity';

@Injectable()
export class PdfService {
  async generateInvoicePDF(
    invoice: Invoice,
    language: 'en' | 'ar' = 'en',
  ): Promise<Buffer> {
    const templatePath = path.join(process.cwd(), 'src', 'modules', 'pdf', 'templates', `invoice-${language}.hbs`);
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateContent);

    const qrCodeData = await this.generateZATCAQRCode(invoice);
    
    const html = template({
      invoice,
      company: invoice.company,
      customer: invoice.customer,
      items: invoice.invoiceItems,
      qrCode: qrCodeData
    });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html);
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });
    
    await browser.close();
    return Buffer.from(pdfBuffer);
  }

  private async generateZATCAQRCode(invoice: Invoice): Promise<string> {
    // ZATCA QR Code format for KSA
    const sellerName = invoice.company.name;
    const vatNumber = invoice.company.trn || '';
    const timestamp = invoice.createdAt.toISOString();
    const invoiceTotal = invoice.totalAmount.toString();
    const vatAmount = invoice.vatAmount.toString();

    return `${sellerName}|${vatNumber}|${timestamp}|${invoiceTotal}|${vatAmount}`;
  }

  async generateVATReport(
    data: any,
    language: 'en' | 'ar' = 'en',
  ): Promise<Buffer> {
    const html = `<html><body><h1>VAT Report - ${language}</h1></body></html>`;
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html);
    
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    
    return Buffer.from(pdfBuffer);
  }
}
