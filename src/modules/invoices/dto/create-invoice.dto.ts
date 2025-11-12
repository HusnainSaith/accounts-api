import {
  IsString,
  IsUUID,
  IsEnum,
  IsDateString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceType } from '../entities/invoice.entity';
import { CreateInvoiceItemDto } from '../../invoice-items/dto/create-invoice-item.dto';

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsNotEmpty()
  @IsEnum(InvoiceType)
  invoiceType: InvoiceType;

  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @IsOptional()
  @IsDateString()
  supplyDate?: Date;

  @IsNotEmpty()
  @IsNumber()
  vatRate: number;

  @IsNotEmpty()
  @IsString()
  currencyCode: string;

  @IsOptional()
  @IsNumber()
  exchangeRateToAed?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  invoiceItems: CreateInvoiceItemDto[];
}
