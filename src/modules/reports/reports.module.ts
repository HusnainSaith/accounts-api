import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './services/reports.service';
import { ExcelExportService } from './services/excel-export.service';
import { ReportsController } from './controllers/reports.controller';
import { Invoice } from '../invoices/entities/invoice.entity';
<<<<<<< HEAD
import { Customer } from '../customers/entities/customer.entity';
import { Expense } from '../expenses/entities/expense.entity';
=======
import { Constant } from '../constant/entities/constant.entity';
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

@Module({
<<<<<<< HEAD
  imports: [TypeOrmModule.forFeature([Invoice, Customer, Expense, User, Role])],
=======
  imports: [TypeOrmModule.forFeature([Invoice, Constant, User, Role])],
>>>>>>> 61eba44dece6bdeb0ab11f5b6b4ff14e43b71f7f
  controllers: [ReportsController],
  providers: [ReportsService, ExcelExportService],
  exports: [ReportsService, ExcelExportService],
})
export class ReportsModule {}