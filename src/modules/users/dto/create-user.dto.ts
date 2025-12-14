import { IsString, IsEmail, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { UserRole, UserLanguage } from '../entities/user.entity';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(UserLanguage)
  preferredLanguage?: UserLanguage;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}