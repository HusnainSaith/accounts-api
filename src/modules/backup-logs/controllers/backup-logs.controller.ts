import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { BackupLogsService } from '../services/backup-logs.service';
import { CreateBackupLogDto, UpdateBackupLogDto } from '../dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('backup-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BackupLogsController {
  constructor(private readonly backupLogsService: BackupLogsService) {}

  @Post()
  @Roles('owner')
  create(@Body() createDto: CreateBackupLogDto) {
    return this.backupLogsService.create(createDto);
  }

  @Get()
  @Roles('owner')
  findAll(@Query('companyId') companyId?: string) {
    return this.backupLogsService.findAll(companyId);
  }

  @Get(':id')
  @Roles('owner')
  findOne(@Param('id') id: string) {
    return this.backupLogsService.findOne(id);
  }

  @Patch(':id')
  @Roles('owner')
  update(@Param('id') id: string, @Body() updateDto: UpdateBackupLogDto) {
    return this.backupLogsService.update(id, updateDto);
  }
}
