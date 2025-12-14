import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOnboardingProgressService } from './services/user-onboarding-progress.service';
import { UserOnboardingProgressController } from './controllers/user-onboarding-progress.controller';
import { UserOnboardingProgress } from './entities/user-onboarding-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserOnboardingProgress])],
  controllers: [UserOnboardingProgressController],
  providers: [UserOnboardingProgressService],
  exports: [UserOnboardingProgressService],
})
export class UserOnboardingProgressModule {}
