import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseCategory } from '../entities/expense.entity';
import { CreateExpenseCategoryDto, UpdateExpenseCategoryDto } from '../dto/expense.dto';

@Injectable()
export class ExpenseCategoriesService {
  constructor(
    @InjectRepository(ExpenseCategory)
    private categoriesRepository: Repository<ExpenseCategory>,
  ) {}

  async create(createDto: CreateExpenseCategoryDto & { companyId: string }): Promise<ExpenseCategory> {
    const category = this.categoriesRepository.create(createDto);
    return this.categoriesRepository.save(category);
  }

  async findAll(companyId: string): Promise<ExpenseCategory[]> {
    return this.categoriesRepository.find({ where: { companyId }, order: { nameEn: 'ASC' } });
  }

  async findOne(id: string, companyId: string): Promise<ExpenseCategory> {
    const category = await this.categoriesRepository.findOne({ where: { id, companyId } });
    if (!category) {
      throw new NotFoundException('Expense category not found');
    }
    return category;
  }

  async update(id: string, updateDto: UpdateExpenseCategoryDto, companyId: string): Promise<ExpenseCategory> {
    const result = await this.categoriesRepository.update({ id, companyId }, updateDto);
    if (result.affected === 0) {
      throw new NotFoundException('Expense category not found');
    }
    return this.findOne(id, companyId);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const result = await this.categoriesRepository.delete({ id, companyId });
    if (result.affected === 0) {
      throw new NotFoundException('Expense category not found');
    }
  }
}
