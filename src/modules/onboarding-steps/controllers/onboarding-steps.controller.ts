import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OnboardingStepsService } from '../services/onboarding-steps.service';
import { CreateOnboardingStepDto, UpdateOnboardingStepDto } from '../dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('onboarding-steps')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OnboardingStepsController {
  constructor(private readonly onboardingStepsService: OnboardingStepsService) {}

  @Post()
  @Roles('owner')
  create(@Body() createDto: CreateOnboardingStepDto) {
    return this.onboardingStepsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.onboardingStepsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.onboardingStepsService.findOne(id);
  }

  @Patch(':id')
  @Roles('owner')
  update(@Param('id') id: string, @Body() updateDto: UpdateOnboardingStepDto) {
    return this.onboardingStepsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('owner')
  remove(@Param('id') id: string) {
    return this.onboardingStepsService.remove(id);
  }
}
