import { IsBoolean } from 'class-validator';

export class UpdateUserOnboardingProgressDto {
  @IsBoolean()
  completed: boolean;
}
