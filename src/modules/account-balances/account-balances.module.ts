import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountBalance } from '../companies/entities/account-balance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountBalance])],
  exports: [TypeOrmModule],
})
export class AccountBalancesModule {}