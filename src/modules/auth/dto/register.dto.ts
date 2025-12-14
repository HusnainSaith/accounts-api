import {
  IsEmail,
  IsString,
  IsIn,
  MinLength,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  companyName?: string;

  @IsOptional()
  @IsString()
  trn?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @IsIn(['AE', 'SA', 'EG'])
  countryCode: string;
}
