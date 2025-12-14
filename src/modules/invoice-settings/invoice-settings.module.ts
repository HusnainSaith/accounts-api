import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceSettingsService } from './services/invoice-settings.service';
import { InvoiceSettingsController } from './controllers/invoice-settings.controller';
import { InvoiceSetting } from './entities/invoice-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceSetting])],
  controllers: [InvoiceSettingsController],
  providers: [InvoiceSettingsService],
  exports: [InvoiceSettingsService],
})
export class InvoiceSettingsModule {}
