import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingStep } from '../entities/onboarding-step.entity';
import { CreateOnboardingStepDto, UpdateOnboardingStepDto } from '../dto';

@Injectable()
export class OnboardingStepsService {
  constructor(
    @InjectRepository(OnboardingStep)
    private onboardingStepsRepository: Repository<OnboardingStep>,
  ) {}

  async create(createDto: CreateOnboardingStepDto): Promise<OnboardingStep> {
    const step = this.onboardingStepsRepository.create(createDto);
    return this.onboardingStepsRepository.save(step);
  }

  async findAll(): Promise<OnboardingStep[]> {
    return this.onboardingStepsRepository.find({ order: { sortOrder: 'ASC' } });
  }

  async findOne(id: string): Promise<OnboardingStep> {
    const step = await this.onboardingStepsRepository.findOne({ where: { id } });
    if (!step) {
      throw new NotFoundException('Onboarding step not found');
    }
    return step;
  }

  async update(id: string, updateDto: UpdateOnboardingStepDto): Promise<OnboardingStep> {
    const result = await this.onboardingStepsRepository.update(id, updateDto);
    if (result.affected === 0) {
      throw new NotFoundException('Onboarding step not found');
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.onboardingStepsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Onboarding step not found');
    }
  }
}
