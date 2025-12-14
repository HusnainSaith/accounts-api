import { IsString, IsOptional, IsObject, IsEnum } from 'class-validator';

export enum OcrStatus {
  PENDING = 'pending',
  PARSED = 'parsed',
  FAILED = 'failed',
}

export class CreateOcrExtractionDto {
  @IsString()
  receiptS3Key: string;

  @IsOptional()
  @IsObject()
  extracted?: Record<string, any>;

  @IsOptional()
  @IsObject()
  confidence?: Record<string, any>;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsEnum(OcrStatus)
  status?: OcrStatus;
}

export class UpdateOcrExtractionDto {
  @IsOptional()
  @IsObject()
  extracted?: Record<string, any>;

  @IsOptional()
  @IsObject()
  confidence?: Record<string, any>;

  @IsOptional()
  @IsEnum(OcrStatus)
  status?: OcrStatus;
}

export class OcrResponseDto {
  vendor?: string;
  amount?: number;
  vatAmount?: number;
  date?: string;
  currency?: string;
  confidence?: {
    vendor?: number;
    amount?: number;
    vatAmount?: number;
    date?: number;
  };
}
