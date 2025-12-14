import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CompanyCounter } from '../../modules/expenses/entities/expense.entity';

@Injectable()
export class InvoiceSequencingService {
  constructor(
    @InjectRepository(CompanyCounter)
    private counterRepository: Repository<CompanyCounter>,
    private dataSource: DataSource,
  ) {}

  /**
   * Get next invoice sequence number for a company
   * Uses atomic database function for thread-safe sequencing
   */
  async getNextInvoiceNumber(
    companyId: string,
    prefix?: string,
  ): Promise<{ sequence: number; formattedNumber: string }> {
    try {
      // Call the PostgreSQL function for atomic sequence increment
      const result = await this.dataSource.query(
        `SELECT next_company_sequence($1, 'invoice') as seq`,
        [companyId],
      );

      const sequence = result[0].seq;

      // Get prefix from company settings or use default
      let invoicePrefix = prefix || companyId.substring(0, 8);

      // Format the invoice number: PREFIX-000001
      const formattedNumber = `${invoicePrefix}-${String(sequence).padStart(6, '0')}`;

      return {
        sequence,
        formattedNumber,
      };
    } catch (error) {
      console.error('Error getting next invoice sequence:', error);
      throw error;
    }
  }

  /**
   * Initialize a company counter if it doesn't exist
   */
  async initializeCompanyCounter(
    companyId: string,
    counterName: string = 'invoice',
    initialValue: number = 0,
  ): Promise<CompanyCounter> {
    try {
      const existing = await this.counterRepository.findOne({
        where: { companyId, name: counterName },
      });

      if (existing) {
        return existing;
      }

      const counter = this.counterRepository.create({
        companyId,
        name: counterName,
        lastValue: initialValue,
        prefix: companyId.substring(0, 8),
        format: '%s-%06d',
      });

      return this.counterRepository.save(counter);
    } catch (error) {
      console.error('Error initializing company counter:', error);
      throw error;
    }
  }

  /**
   * Get current counter value without incrementing
   */
  async getCurrentCounterValue(
    companyId: string,
    counterName: string = 'invoice',
  ): Promise<number> {
    const counter = await this.counterRepository.findOne({
      where: { companyId, name: counterName },
    });

    return counter?.lastValue ?? 0;
  }

  /**
   * Reset counter to a specific value (use with caution)
   */
  async resetCounter(
    companyId: string,
    counterName: string = 'invoice',
    value: number = 0,
  ): Promise<CompanyCounter> {
    let counter = await this.counterRepository.findOne({
      where: { companyId, name: counterName },
    });

    if (!counter) {
      return this.initializeCompanyCounter(companyId, counterName, value);
    }

    counter.lastValue = value;
    return this.counterRepository.save(counter);
  }
}
