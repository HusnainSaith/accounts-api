import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BackupLogsService } from './services/backup-logs.service';
import { BackupLogsController } from './controllers/backup-logs.controller';
import { BackupLog } from './entities/backup-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BackupLog])],
  controllers: [BackupLogsController],
  providers: [BackupLogsService],
  exports: [BackupLogsService],
})
export class BackupLogsModule {}
