import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateInvoiceSettingDto {
  @IsNumber()
  @Min(1)
  nextInvoiceNumber: number;

  @IsString()
  invoicePrefix: string;

  @IsString()
  invoiceNumberFormat: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultPaymentTermsDays?: number;

  @IsOptional()
  @IsString()
  defaultNotesEn?: string;

  @IsOptional()
  @IsString()
  defaultNotesAr?: string;

  @IsOptional()
  @IsBoolean()
  includeCompanyLogo?: boolean;

  @IsOptional()
  @IsBoolean()
  autoSendOnCreate?: boolean;

  @IsOptional()
  @IsBoolean()
  enableQrCode?: boolean;
}
