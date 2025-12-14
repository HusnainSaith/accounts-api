import { IsString, MinLength, IsOptional } from 'class-validator';

export class UpdatePermissionDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}