import { Entity, Column, CreateDateColumn, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OnboardingStep } from '../../onboarding-steps/entities/onboarding-step.entity';

@Entity('user_onboarding_progress')
export class UserOnboardingProgress {
  @PrimaryColumn({ name: 'user_id' })
  userId: string;

  @PrimaryColumn({ name: 'step_id' })
  stepId: string;

  @Column({ default: false })
  completed: boolean;

  @CreateDateColumn({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => OnboardingStep, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'step_id' })
  step: OnboardingStep;
}
