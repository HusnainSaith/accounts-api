import { Injectable, Logger } from '@nestjs/common';
import { TextractClient, AnalyzeExpenseCommand } from '@aws-sdk/client-textract';
import sharp from 'sharp';
const Tesseract = require('tesseract.js');

export interface OcrResult {
  vendor?: string;
  amount?: number;
  vatAmount?: number;
  date?: string;
  invoiceNumber?: string;
  confidence: number;
  rawText?: string;
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private textractClient: TextractClient;

  constructor() {
    this.textractClient = new TextractClient({
      region: process.env.AWS_REGION || 'me-south-1',
    });
  }

  async extractReceiptData(imageBuffer: Buffer, useAWS: boolean = false): Promise<OcrResult> {
    try {
      if (useAWS && process.env.AWS_TEXTRACT_ENABLED === 'true') {
        return await this.extractWithTextract(imageBuffer);
      }
      return await this.extractWithTesseract(imageBuffer);
    } catch (error) {
      this.logger.error('OCR extraction failed', error);
      throw error;
    }
  }

  private async extractWithTextract(imageBuffer: Buffer): Promise<OcrResult> {
    const command = new AnalyzeExpenseCommand({
      Document: { Bytes: imageBuffer },
    });

    const response = await this.textractClient.send(command);
    const expenseDoc = response.ExpenseDocuments?.[0];

    if (!expenseDoc) {
      throw new Error('No expense data found');
    }

    const result: OcrResult = { confidence: 0 };
    const summaryFields = expenseDoc.SummaryFields || [];

    for (const field of summaryFields) {
      const type = field.Type?.Text?.toLowerCase();
      const value = field.ValueDetection?.Text;
      const confidence = field.ValueDetection?.Confidence || 0;

      result.confidence = Math.max(result.confidence, confidence);

      if (type?.includes('vendor') || type?.includes('name')) {
        result.vendor = value;
      } else if (type?.includes('total') || type?.includes('amount')) {
        result.amount = this.parseAmount(value);
      } else if (type?.includes('tax') || type?.includes('vat')) {
        result.vatAmount = this.parseAmount(value);
      } else if (type?.includes('date')) {
        result.date = value;
      } else if (type?.includes('invoice')) {
        result.invoiceNumber = value;
      }
    }

    return result;
  }

  private async extractWithTesseract(imageBuffer: Buffer): Promise<OcrResult> {
    // Preprocess image for better OCR
    const processedImage = await sharp(imageBuffer)
      .greyscale()
      .normalize()
      .sharpen()
      .toBuffer();

    // Run OCR with Arabic and English support
    const { data } = await Tesseract.recognize(processedImage, 'ara+eng', {
      logger: (m) => this.logger.debug(m),
    });

    const text = data.text;
    const result: OcrResult = {
      confidence: data.confidence,
      rawText: text,
    };

    // Extract vendor (usually first line)
    const lines = text.split('\n').filter((l) => l.trim());
    if (lines.length > 0) {
      result.vendor = lines[0].trim();
    }

    // Extract amount (look for numbers with currency or total keywords)
    const amountPatterns = [
      /(?:total|المجموع|إجمالي)[:\s]*(\d+[.,]\d+)/i,
      /(\d+[.,]\d+)\s*(?:sar|aed|egp|ريال|درهم|جنيه)/i,
    ];

    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.amount = this.parseAmount(match[1]);
        break;
      }
    }

    // Extract VAT
    const vatPatterns = [
      /(?:vat|tax|ضريبة|القيمة المضافة)[:\s]*(\d+[.,]\d+)/i,
    ];

    for (const pattern of vatPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.vatAmount = this.parseAmount(match[1]);
        break;
      }
    }

    // Extract date
    const datePatterns = [
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
      /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        result.date = match[1];
        break;
      }
    }

    return result;
  }

  private parseAmount(value?: string): number | undefined {
    if (!value) return undefined;
    const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? undefined : parsed;
  }

  async batchExtract(imageBuffers: Buffer[]): Promise<OcrResult[]> {
    return Promise.all(
      imageBuffers.map((buffer) => this.extractReceiptData(buffer)),
    );
  }
}
