import {
  IsString,
  IsUUID,
  IsNumber,
  IsOptional,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateInvoiceItemDto {
  @IsUUID()
  itemId: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercentage?: number;

  @IsNumber()
  @Min(0)
  vatRate: number;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
