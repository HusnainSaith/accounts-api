import { Controller, Get, Post, Body, Patch, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { EncryptionKeysService } from '../services/encryption-keys.service';
import { CreateEncryptionKeyDto, UpdateEncryptionKeyDto } from '../dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CompanyGuard } from '../../../common/guards/company.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RLSInterceptor } from '../../../common/interceptors/rls.interceptor';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('encryption-keys')
@UseGuards(JwtAuthGuard, RolesGuard, CompanyGuard)
@UseInterceptors(RLSInterceptor)
export class EncryptionKeysController {
  constructor(private readonly encryptionKeysService: EncryptionKeysService) {}

  @Post()
  @Roles('owner')
  create(@Body() createDto: CreateEncryptionKeyDto, @CompanyContext() companyId: string) {
    return this.encryptionKeysService.create({ ...createDto, companyId });
  }

  @Get()
  @Roles('owner')
  findByCompany(@CompanyContext() companyId: string) {
    return this.encryptionKeysService.findByCompany(companyId);
  }

  @Patch(':id')
  @Roles('owner')
  update(@Param('id') id: string, @Body() updateDto: UpdateEncryptionKeyDto) {
    return this.encryptionKeysService.update(id, updateDto);
  }
}
