import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceSetting } from '../entities/invoice-setting.entity';
import { CreateInvoiceSettingDto, UpdateInvoiceSettingDto } from '../dto';

@Injectable()
export class InvoiceSettingsService {
  constructor(
    @InjectRepository(InvoiceSetting)
    private invoiceSettingsRepository: Repository<InvoiceSetting>,
  ) {}

  async create(createDto: CreateInvoiceSettingDto & { companyId: string }): Promise<InvoiceSetting> {
    const setting = this.invoiceSettingsRepository.create(createDto);
    return this.invoiceSettingsRepository.save(setting);
  }

  async findByCompany(companyId: string): Promise<InvoiceSetting> {
    const setting = await this.invoiceSettingsRepository.findOne({ where: { companyId } });
    if (!setting) {
      throw new NotFoundException('Invoice settings not found');
    }
    return setting;
  }

  async update(companyId: string, updateDto: UpdateInvoiceSettingDto): Promise<InvoiceSetting> {
    const result = await this.invoiceSettingsRepository.update({ companyId }, updateDto);
    if (result.affected === 0) {
      throw new NotFoundException('Invoice settings not found');
    }
    return this.findByCompany(companyId);
  }

  async incrementInvoiceNumber(companyId: string): Promise<number> {
    const setting = await this.findByCompany(companyId);
    const currentNumber = setting.nextInvoiceNumber;
    await this.invoiceSettingsRepository.update({ companyId }, { nextInvoiceNumber: currentNumber + 1 });
    return currentNumber;
  }
}
