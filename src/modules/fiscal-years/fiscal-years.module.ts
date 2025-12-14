import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FiscalYear } from '../companies/entities/fiscal-year.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FiscalYear])],
  exports: [TypeOrmModule],
})
export class FiscalYearsModule {}