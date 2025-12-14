import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

export enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  AUTOMATED = 'automated',
}

export enum BackupStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('backup_logs')
export class BackupLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', nullable: true })
  companyId: string;

  @Column({ name: 'backup_type', type: 'enum', enum: BackupType })
  backupType: BackupType;

  @Column({ name: 'backup_location', length: 500 })
  backupLocation: string;

  @Column({ name: 'file_size_mb', type: 'decimal', precision: 18, scale: 2, nullable: true })
  fileSizeMb: number;

  @Column({ type: 'enum', enum: BackupStatus })
  status: BackupStatus;

  @Column({ name: 'initiated_by', nullable: true })
  initiatedBy: string;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @ManyToOne(() => Company, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
