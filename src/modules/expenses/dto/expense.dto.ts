import { IsString, IsNumber, IsDate, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseCategoryDto {
  @IsString()
  nameEn: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateExpenseCategoryDto {
  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class CreateExpenseDto {
  @IsString()
  categoryId: string;

  @IsString()
  vendorEn: string;

  @IsOptional()
  @IsString()
  vendorAr?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  currency: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expenseDate?: Date;

  @IsOptional()
  @IsBoolean()
  taxable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vatRate?: number;

  @IsOptional()
  @IsBoolean()
  isDeductible?: boolean;

  @IsOptional()
  @IsString()
  receiptS3Key?: string;

  @IsOptional()
  @IsString()
  ocrLanguage?: string;

  @IsOptional()
  @IsString()
  notesEn?: string;

  @IsOptional()
  @IsString()
  notesAr?: string;
}

export class UpdateExpenseDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  vendorEn?: string;

  @IsOptional()
  @IsString()
  vendorAr?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expenseDate?: Date;

  @IsOptional()
  @IsBoolean()
  taxable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vatRate?: number;

  @IsOptional()
  @IsBoolean()
  isDeductible?: boolean;

  @IsOptional()
  @IsString()
  notesEn?: string;

  @IsOptional()
  @IsString()
  notesAr?: string;
}

export class ExpenseFilterDto {
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsBoolean()
  taxable?: boolean;

  @IsOptional()
  @IsBoolean()
  isDeductible?: boolean;
}

export class OcrExtractionDto {
  @IsString()
  receiptS3Key: string;

  @IsOptional()
  extracted?: Record<string, any>;

  @IsOptional()
  confidence?: Record<string, any>;

  @IsOptional()
  @IsString()
  source?: string;
}

export class PaymentDto {
  @IsString()
  invoiceId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  paymentMethod: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
