import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsBoolean, IsUUID, MaxLength, Min } from 'class-validator';
import { ConstantType } from '../entities/constant.entity';

export class UpdateConstantDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsEnum(ConstantType)
  type?: ConstantType;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  taxRegistrationNo?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  paymentTerms?: number;

  @IsOptional()
  @IsUUID()
  accountId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}