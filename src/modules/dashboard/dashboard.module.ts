import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './services/dashboard.service';
import { DashboardController } from './controllers/dashboard.controller';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Item } from '../items/entities/item.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { VatReport } from '../vat-reports/entities/vat-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Customer, Item, Expense, VatReport])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}