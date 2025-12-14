import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingStepsService } from './services/onboarding-steps.service';
import { OnboardingStepsController } from './controllers/onboarding-steps.controller';
import { OnboardingStep } from './entities/onboarding-step.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OnboardingStep])],
  controllers: [OnboardingStepsController],
  providers: [OnboardingStepsService],
  exports: [OnboardingStepsService],
})
export class OnboardingStepsModule {}
