import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { UserOnboardingProgressService } from '../services/user-onboarding-progress.service';
import { CreateUserOnboardingProgressDto, UpdateUserOnboardingProgressDto } from '../dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('user-onboarding-progress')
@UseGuards(JwtAuthGuard)
export class UserOnboardingProgressController {
  constructor(private readonly progressService: UserOnboardingProgressService) {}

  @Post()
  create(@Body() createDto: CreateUserOnboardingProgressDto, @Req() req: any) {
    return this.progressService.create({ ...createDto, userId: req.user.id });
  }

  @Get()
  findByUser(@Req() req: any) {
    return this.progressService.findByUser(req.user.id);
  }

  @Get('percentage')
  getCompletionPercentage(@Req() req: any) {
    return this.progressService.getCompletionPercentage(req.user.id);
  }

  @Patch(':stepId')
  update(@Param('stepId') stepId: string, @Body() updateDto: UpdateUserOnboardingProgressDto, @Req() req: any) {
    return this.progressService.update(req.user.id, stepId, updateDto);
  }

  @Post(':stepId/complete')
  markComplete(@Param('stepId') stepId: string, @Req() req: any) {
    return this.progressService.markComplete(req.user.id, stepId);
  }
}
