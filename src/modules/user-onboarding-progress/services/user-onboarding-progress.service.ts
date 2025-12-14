import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserOnboardingProgress } from '../entities/user-onboarding-progress.entity';
import { CreateUserOnboardingProgressDto, UpdateUserOnboardingProgressDto } from '../dto';

@Injectable()
export class UserOnboardingProgressService {
  constructor(
    @InjectRepository(UserOnboardingProgress)
    private progressRepository: Repository<UserOnboardingProgress>,
  ) {}

  async create(createDto: CreateUserOnboardingProgressDto & { userId: string }): Promise<UserOnboardingProgress> {
    const progress = this.progressRepository.create(createDto);
    return this.progressRepository.save(progress);
  }

  async findByUser(userId: string): Promise<UserOnboardingProgress[]> {
    return this.progressRepository.find({ where: { userId }, relations: ['step'] });
  }

  async findOne(userId: string, stepId: string): Promise<UserOnboardingProgress> {
    const progress = await this.progressRepository.findOne({ where: { userId, stepId } });
    if (!progress) {
      throw new NotFoundException('Progress not found');
    }
    return progress;
  }

  async update(userId: string, stepId: string, updateDto: UpdateUserOnboardingProgressDto): Promise<UserOnboardingProgress> {
    const result = await this.progressRepository.update({ userId, stepId }, { ...updateDto, completedAt: new Date() });
    if (result.affected === 0) {
      throw new NotFoundException('Progress not found');
    }
    return this.findOne(userId, stepId);
  }

  async markComplete(userId: string, stepId: string): Promise<UserOnboardingProgress> {
    return this.update(userId, stepId, { completed: true });
  }

  async getCompletionPercentage(userId: string): Promise<number> {
    const [completed, total] = await Promise.all([
      this.progressRepository.count({ where: { userId, completed: true } }),
      this.progressRepository.count({ where: { userId } })
    ]);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }
}
