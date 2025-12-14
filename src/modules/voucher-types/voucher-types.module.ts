import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherType } from '../companies/entities/voucher-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VoucherType])],
  exports: [TypeOrmModule],
})
export class VoucherTypesModule {}