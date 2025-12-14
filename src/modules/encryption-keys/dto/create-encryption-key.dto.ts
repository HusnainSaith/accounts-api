import { IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateEncryptionKeyDto {
  @IsString()
  keyName: string;

  @IsString()
  encryptedKey: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  keyVersion?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
