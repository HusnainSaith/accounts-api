import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Expense,
  ExpenseCategory,
  OcrExtraction,
  Payment,
  CompanyCounter,
} from './entities/expense.entity';
import { ExpensesService } from './services/expenses.service';
import { PaymentsService } from './services/payments.service';
import { OcrService } from './services/ocr.service';
import { ExpenseCategoriesService } from './services/expense-categories.service';
import { ExpensesController } from './controllers/expenses.controller';
import { ExpenseCategoriesController } from './controllers/expense-categories.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Expense,
      ExpenseCategory,
      OcrExtraction,
      Payment,
      CompanyCounter,
    ]),
  ],
  controllers: [ExpensesController, ExpenseCategoriesController],
  providers: [ExpensesService, PaymentsService, OcrService, ExpenseCategoriesService],
  exports: [ExpensesService, PaymentsService, OcrService, ExpenseCategoriesService],
})
export class ExpensesModule {}
