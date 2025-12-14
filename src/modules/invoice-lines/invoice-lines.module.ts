import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceLine } from '../invoice-items/entities/invoice-line.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceLine])],
  exports: [TypeOrmModule],
})
export class InvoiceLinesModule {}