import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BackupLog, BackupStatus } from '../entities/backup-log.entity';
import { CreateBackupLogDto, UpdateBackupLogDto } from '../dto';

@Injectable()
export class BackupLogsService {
  constructor(
    @InjectRepository(BackupLog)
    private backupLogsRepository: Repository<BackupLog>,
  ) {}

  async create(createDto: CreateBackupLogDto): Promise<BackupLog> {
    const log = this.backupLogsRepository.create(createDto);
    return this.backupLogsRepository.save(log);
  }

  async findAll(companyId?: string): Promise<BackupLog[]> {
    const where = companyId ? { companyId } : {};
    return this.backupLogsRepository.find({ where, order: { startedAt: 'DESC' } });
  }

  async findOne(id: string): Promise<BackupLog> {
    const log = await this.backupLogsRepository.findOne({ where: { id } });
    if (!log) {
      throw new NotFoundException('Backup log not found');
    }
    return log;
  }

  async update(id: string, updateDto: UpdateBackupLogDto): Promise<BackupLog> {
    const result = await this.backupLogsRepository.update(id, updateDto);
    if (result.affected === 0) {
      throw new NotFoundException('Backup log not found');
    }
    return this.findOne(id);
  }

  async completeBackup(id: string, fileSizeMb: number): Promise<BackupLog> {
    return this.update(id, { status: BackupStatus.COMPLETED, fileSizeMb });
  }

  async failBackup(id: string): Promise<BackupLog> {
    return this.update(id, { status: BackupStatus.FAILED });
  }
}
