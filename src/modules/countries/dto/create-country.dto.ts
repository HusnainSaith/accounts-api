import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  code: string;

  @IsString()
  nameEn: string;

  @IsString()
  nameAr: string;

  @IsString()
  currencyCode: string;

  @IsString()
  currencySymbol: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  defaultVatRate: number;

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
