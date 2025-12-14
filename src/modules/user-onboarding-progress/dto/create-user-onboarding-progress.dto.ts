import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateUserOnboardingProgressDto {
  @IsString()
  stepId: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
