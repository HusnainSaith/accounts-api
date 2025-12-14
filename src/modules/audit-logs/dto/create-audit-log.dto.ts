import { IsString, IsUUID, IsOptional, IsObject } from 'class-validator';

export class CreateAuditLogDto {
  @IsUUID()
  companyId: string;

  @IsOptional()
  @IsUUID()
  actorUserId?: string;

  @IsString()
  action: string;

  @IsString()
  entity: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsObject()
  before?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  after?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  ip?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}