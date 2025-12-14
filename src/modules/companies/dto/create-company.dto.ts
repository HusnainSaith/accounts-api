import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsIn,
  MinLength,
  IsNumber,
} from 'class-validator';
export class CreateCompanyDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsIn(['UAE', 'KSA', 'EGY'])
  countryCode: string;

  @IsString()
  @IsIn(['AED', 'SAR', 'EGP'])
  currencyCode: string;

  @IsNumber()
  vatRate: number;

  @IsOptional()
  @IsString()
  trn?: string;

  @IsOptional()
  @IsString()
  crNumber?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isTestAccount?: boolean;
}
