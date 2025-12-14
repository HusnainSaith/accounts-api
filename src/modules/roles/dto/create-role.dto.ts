import { IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateRoleDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsString()
  @MinLength(2)
  code: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}