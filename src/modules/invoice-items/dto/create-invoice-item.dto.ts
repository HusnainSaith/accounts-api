import { IsString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateInvoiceItemDto {
  @IsOptional()
  @IsUUID()
  itemId?: string;

  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  discountPercentage?: number;

  @IsNumber()
  vatRate: number;
}