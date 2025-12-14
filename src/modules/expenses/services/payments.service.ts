import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentMethod } from '../entities/expense.entity';
import { CreatePaymentDto, UpdatePaymentDto } from '../dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async createPayment(companyId: string, dto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create({
      ...dto,
      companyId,
    });
    return this.paymentRepository.save(payment);
  }

  async findAllByCompany(companyId: string, filters?: any): Promise<Payment[]> {
    let query = this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.company_id = :companyId', { companyId });

    if (filters?.invoiceId) {
      query = query.andWhere('payment.invoice_id = :invoiceId', {
        invoiceId: filters.invoiceId,
      });
    }

    if (filters?.startDate) {
      query = query.andWhere('payment.payment_date >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query = query.andWhere('payment.payment_date <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters?.paymentMethod) {
      query = query.andWhere('payment.payment_method = :paymentMethod', {
        paymentMethod: filters.paymentMethod,
      });
    }

    return query.orderBy('payment.payment_date', 'DESC').getMany();
  }

  async findById(id: string, companyId: string): Promise<Payment | null> {
    return this.paymentRepository.findOne({
      where: { id, companyId },
    });
  }

  async updatePayment(
    id: string,
    companyId: string,
    dto: UpdatePaymentDto,
  ): Promise<Payment> {
    const payment = await this.findById(id, companyId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    Object.assign(payment, dto);
    return this.paymentRepository.save(payment);
  }

  async deletePayment(id: string, companyId: string): Promise<boolean> {
    const result = await this.paymentRepository.delete({ id, companyId });
    return (result.affected ?? 0) > 0;
  }

  async getPaymentStats(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    let query = this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'totalAmount')
      .addSelect('COUNT(payment.id)', 'count')
      .addSelect('AVG(payment.amount)', 'averageAmount')
      .where('payment.company_id = :companyId', { companyId });

    if (startDate) {
      query = query.andWhere('payment.payment_date >= :startDate', { startDate });
    }

    if (endDate) {
      query = query.andWhere('payment.payment_date <= :endDate', { endDate });
    }

    const result = await query.getRawOne();

    return {
      totalAmount: result.totalAmount || 0,
      count: parseInt(result.count || 0),
      averageAmount: result.averageAmount || 0,
    };
  }

  async getPaymentsByMethod(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]> {
    let query = this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.payment_method', 'method')
      .addSelect('SUM(payment.amount)', 'totalAmount')
      .addSelect('COUNT(payment.id)', 'count')
      .where('payment.company_id = :companyId', { companyId })
      .groupBy('payment.payment_method');

    if (startDate) {
      query = query.andWhere('payment.payment_date >= :startDate', { startDate });
    }

    if (endDate) {
      query = query.andWhere('payment.payment_date <= :endDate', { endDate });
    }

    return query.orderBy('totalAmount', 'DESC').getRawMany();
  }
}
