import { Transform } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

export class CreateItemDto {
  @IsOptional()
  @IsString()
  itemCode?: string;

  @IsNotEmpty()
  @IsString()
  nameEn: string; // Changed from 'name'

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string; // Changed from 'description'

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsNotEmpty()
  @IsNumber()
  unitPrice: number; // This should match your 'price' field

  @IsNotEmpty()
  @IsString()
  currencyCode: string;

  @IsOptional()
  @IsNumber()
  defaultVatRate?: number; // This should match your 'vatRate' field

  @IsOptional()
  @IsBoolean()
  isService?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }): boolean => value ?? true)
  aiSuggested: boolean = true;
}
