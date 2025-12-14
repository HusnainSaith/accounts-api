import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Expense,
  ExpenseCategory,
  OcrExtraction,
  CompanyCounter,
} from '../entities/expense.entity';
import { CreateExpenseDto, UpdateExpenseDto } from '../dto/expense.dto';
import { CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from '../dto/expense-category.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(ExpenseCategory)
    private categoryRepository: Repository<ExpenseCategory>,
    @InjectRepository(OcrExtraction)
    private ocrRepository: Repository<OcrExtraction>,
    @InjectRepository(CompanyCounter)
    private counterRepository: Repository<CompanyCounter>,
    private dataSource: DataSource,
  ) {}

  async createExpense(companyId: string, dto: CreateExpenseDto): Promise<Expense> {
    const expense = this.expenseRepository.create({
      ...dto,
      companyId,
    });

    // Calculate VAT if taxable
    if (dto.taxable && dto.vatRate) {
      expense.vatAmount = Number(
        (Number(dto.amount) * (Number(dto.vatRate) / 100)).toFixed(4),
      );
    }

    return this.expenseRepository.save(expense);
  }

  async findAllByCompany(companyId: string, filters?: any): Promise<Expense[]> {
    let query = this.expenseRepository
      .createQueryBuilder('expense')
      .where('expense.company_id = :companyId', { companyId });

    if (filters?.startDate) {
      query = query.andWhere('expense.expense_date >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query = query.andWhere('expense.expense_date <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters?.categoryId) {
      query = query.andWhere('expense.category_id = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters?.taxable !== undefined) {
      query = query.andWhere('expense.taxable = :taxable', {
        taxable: filters.taxable,
      });
    }

    return query
      .leftJoinAndSelect('expense.category', 'category')
      .orderBy('expense.expense_date', 'DESC')
      .addOrderBy('expense.created_at', 'DESC')
      .getMany();
  }

  async findById(id: string, companyId: string): Promise<Expense | null> {
    return this.expenseRepository.findOne({
      where: { id, companyId },
      relations: ['category'],
    });
  }

  async updateExpense(
    id: string,
    companyId: string,
    dto: UpdateExpenseDto,
  ): Promise<Expense> {
    const expense = await this.findById(id, companyId);
    if (!expense) {
      throw new Error('Expense not found');
    }

    Object.assign(expense, dto);

    // Recalculate VAT if amount or rate changed
    if ((dto.amount || dto.vatRate) && expense.taxable) {
      const amount = dto.amount ?? expense.amount;
      const vatRate = dto.vatRate ?? expense.vatRate;
      if (vatRate) {
        expense.vatAmount = Number(
          (Number(amount) * (Number(vatRate) / 100)).toFixed(4),
        );
      }
    }

    return this.expenseRepository.save(expense);
  }

  async deleteExpense(id: string, companyId: string): Promise<boolean> {
    const result = await this.expenseRepository.delete({ id, companyId });
    return (result.affected ?? 0) > 0;
  }

  // Categories
  async createCategory(
    companyId: string,
    dto: CreateExpenseCategoryDto,
  ): Promise<ExpenseCategory> {
    const category = this.categoryRepository.create({
      ...dto,
      companyId,
    });
    return this.categoryRepository.save(category);
  }

  async findCategoriesByCompany(companyId: string): Promise<ExpenseCategory[]> {
    return this.categoryRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findCategoryById(id: string, companyId: string): Promise<ExpenseCategory | null> {
    return this.categoryRepository.findOne({
      where: { id, companyId },
    });
  }

  async updateCategory(
    id: string,
    companyId: string,
    dto: UpdateExpenseCategoryDto,
  ): Promise<ExpenseCategory> {
    const category = await this.findCategoryById(id, companyId);
    if (!category) {
      throw new Error('Category not found');
    }

    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: string, companyId: string): Promise<boolean> {
    const result = await this.categoryRepository.delete({ id, companyId });
    return (result.affected ?? 0) > 0;
  }

  // OCR Extractions
  async createOcrExtraction(
    companyId: string,
    receiptS3Key: string,
    extracted: Record<string, any>,
    source: string = 'tesseract',
  ): Promise<OcrExtraction> {
    const ocr = this.ocrRepository.create({
      companyId,
      receiptS3Key,
      extracted,
      source,
      status: 'parsed',
    });
    return this.ocrRepository.save(ocr);
  }

  async findOcrExtractionsByCompany(companyId: string): Promise<OcrExtraction[]> {
    return this.ocrRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOcrById(id: string, companyId: string): Promise<OcrExtraction | null> {
    return this.ocrRepository.findOne({
      where: { id, companyId },
    });
  }

  async markOcrAsProcessed(id: string, companyId: string): Promise<OcrExtraction> {
    const ocr = await this.findOcrById(id, companyId);
    if (!ocr) {
      throw new Error('OCR extraction not found');
    }

    ocr.processedAt = new Date();
    ocr.status = 'processed';
    return this.ocrRepository.save(ocr);
  }

  // Company counters / sequencing
  async getNextSequence(
    companyId: string,
    counterName: string = 'expense',
  ): Promise<number> {
    const connection = this.dataSource;
    const result = await connection.query(
      `SELECT next_company_sequence($1, $2) as seq`,
      [companyId, counterName],
    );
    return result[0].seq;
  }

  async getExpenseStats(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    let query = this.expenseRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'totalAmount')
      .addSelect('SUM(expense.vat_amount)', 'totalVat')
      .addSelect('COUNT(expense.id)', 'count')
      .addSelect('AVG(expense.amount)', 'averageAmount')
      .where('expense.company_id = :companyId', { companyId });

    if (startDate) {
      query = query.andWhere('expense.expense_date >= :startDate', { startDate });
    }

    if (endDate) {
      query = query.andWhere('expense.expense_date <= :endDate', { endDate });
    }

    const result = await query.getRawOne();

    return {
      totalAmount: result.totalAmount || 0,
      totalVat: result.totalVat || 0,
      count: parseInt(result.count || 0),
      averageAmount: result.averageAmount || 0,
    };
  }

  async getExpensesByCategory(
    companyId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]> {
    let query = this.expenseRepository
      .createQueryBuilder('expense')
      .select('category.name_en', 'categoryName')
      .addSelect('category.name_ar', 'categoryNameAr')
      .addSelect('SUM(expense.amount)', 'totalAmount')
      .addSelect('COUNT(expense.id)', 'count')
      .leftJoin('expense.category', 'category')
      .where('expense.company_id = :companyId', { companyId })
      .groupBy('category.id')
      .addGroupBy('category.name_en')
      .addGroupBy('category.name_ar');

    if (startDate) {
      query = query.andWhere('expense.expense_date >= :startDate', { startDate });
    }

    if (endDate) {
      query = query.andWhere('expense.expense_date <= :endDate', { endDate });
    }

    return query.orderBy('totalAmount', 'DESC').getRawMany();
  }
}
