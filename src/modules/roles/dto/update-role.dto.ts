import { IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  code?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}