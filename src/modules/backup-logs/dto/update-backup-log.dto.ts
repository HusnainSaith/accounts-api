import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { BackupStatus } from '../entities/backup-log.entity';

export class UpdateBackupLogDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSizeMb?: number;

  @IsOptional()
  @IsEnum(BackupStatus)
  status?: BackupStatus;
}
