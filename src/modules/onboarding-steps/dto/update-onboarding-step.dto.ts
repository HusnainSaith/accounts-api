import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class UpdateOnboardingStepDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  stepNumber?: number;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  titleAr?: string;

  @IsOptional()
  @IsString()
  descriptionEn?: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsOptional()
  @IsString()
  actionLabelEn?: string;

  @IsOptional()
  @IsString()
  actionLabelAr?: string;

  @IsOptional()
  @IsString()
  actionUrl?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
