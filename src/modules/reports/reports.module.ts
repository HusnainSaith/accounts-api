import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './services/reports.service';
import { ExcelExportService } from './services/excel-export.service';
import { ReportsController } from './controllers/reports.controller';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Customer, Expense, User, Role])],
  controllers: [ReportsController],
  providers: [ReportsService, ExcelExportService],
  exports: [ReportsService, ExcelExportService],
})
export class ReportsModule {}