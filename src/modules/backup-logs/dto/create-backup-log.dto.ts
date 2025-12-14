import { IsString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { BackupType, BackupStatus } from '../entities/backup-log.entity';

export class CreateBackupLogDto {
  @IsOptional()
  @IsString()
  companyId?: string;

  @IsEnum(BackupType)
  backupType: BackupType;

  @IsString()
  backupLocation: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSizeMb?: number;

  @IsEnum(BackupStatus)
  status: BackupStatus;

  @IsOptional()
  @IsString()
  initiatedBy?: string;
}
