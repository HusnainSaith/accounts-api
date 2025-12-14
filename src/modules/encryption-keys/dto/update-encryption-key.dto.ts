import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateEncryptionKeyDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
