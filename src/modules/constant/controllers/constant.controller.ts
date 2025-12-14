import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ConstantService } from '../services/constant.service';
import { CreateConstantDto, UpdateConstantDto } from '../dto';
import { CompanyContext } from '../../../common/decorators/company-context.decorator';

@Controller('constants')
export class ConstantController {
  constructor(private readonly constantService: ConstantService) {}

  @Post()
  create(
    @CompanyContext() companyId: string,
    @Body() createConstantDto: CreateConstantDto,
  ) {
    return this.constantService.create(companyId, createConstantDto);
  }

  @Get()
  findAll(
    @CompanyContext() companyId: string,
    @Query('type') type?: string,
  ) {
    if (type) {
      return this.constantService.findByType(companyId, type);
    }
    return this.constantService.findAll(companyId);
  }

  @Get(':id')
  findOne(
    @CompanyContext() companyId: string,
    @Param('id') id: string,
  ) {
    return this.constantService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @CompanyContext() companyId: string,
    @Param('id') id: string,
    @Body() updateConstantDto: UpdateConstantDto,
  ) {
    return this.constantService.update(companyId, id, updateConstantDto);
  }

  @Delete(':id')
  remove(
    @CompanyContext() companyId: string,
    @Param('id') id: string,
  ) {
    return this.constantService.remove(companyId, id);
  }
}