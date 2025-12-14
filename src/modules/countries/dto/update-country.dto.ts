import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class UpdateCountryDto {
  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  currencyCode?: string;

  @IsOptional()
  @IsString()
  currencySymbol?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultVatRate?: number;

  @IsOptional()
  @IsBoolean()
  trnRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  qrCodeRequired?: boolean;

  @IsOptional()
  @IsString()
  dateFormat?: string;

  @IsOptional()
  @IsString()
  numberFormat?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
