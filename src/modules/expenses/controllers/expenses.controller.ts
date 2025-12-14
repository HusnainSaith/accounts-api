import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ExpensesService } from '../services/expenses.service';
import { PaymentsService } from '../services/payments.service';
import { OcrService } from '../services/ocr.service';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseFilterDto } from '../dto/expense.dto';
import { CreatePaymentDto, UpdatePaymentDto } from '../dto/payment.dto';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(
    private expensesService: ExpensesService,
    private paymentsService: PaymentsService,
    private ocrService: OcrService,
  ) {}

  // Expenses
  @Post()
  async createExpense(@Body() dto: CreateExpenseDto, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.expensesService.createExpense(companyId, dto);
  }

  @Get()
  async getAllExpenses(@Query() filters: ExpenseFilterDto, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.expensesService.findAllByCompany(companyId, filters);
  }

  @Get(':id')
  async getExpenseById(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.expensesService.findById(id, companyId);
  }

  @Put(':id')
  async updateExpense(
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
    @Req() req: any,
  ) {
    const companyId = req.user.companyId;
    return this.expensesService.updateExpense(id, companyId, dto);
  }

  @Delete(':id')
  async deleteExpense(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user.companyId;
    const success = await this.expensesService.deleteExpense(id, companyId);
    return { success };
  }

  @Get('stats/summary')
  async getExpenseStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: any,
  ) {
    const companyId = req.user.companyId;
    return this.expensesService.getExpenseStats(
      companyId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('stats/by-category')
  async getExpensesByCategory(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: any,
  ) {
    const companyId = req.user.companyId;
    return this.expensesService.getExpensesByCategory(
      companyId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  // Categories
  @Post('categories')
  async createCategory(@Body() dto: any, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.expensesService.createCategory(companyId, dto);
  }

  @Get('categories')
  async getAllCategories(@Req() req: any) {
    const companyId = req.user.companyId;
    return this.expensesService.findCategoriesByCompany(companyId);
  }

  @Get('categories/:id')
  async getCategoryById(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.expensesService.findCategoryById(id, companyId);
  }

  @Put('categories/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    const companyId = req.user.companyId;
    return this.expensesService.updateCategory(id, companyId, dto);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user.companyId;
    const success = await this.expensesService.deleteCategory(id, companyId);
    return { success };
  }

  // OCR
  @Post('ocr/scan')
  @UseInterceptors(FileInterceptor('receipt'))
  async scanReceipt(
    @UploadedFile() file: Express.Multer.File,
    @Query('useAWS') useAWS: string,
    @Req() req: any,
  ) {
    const result = await this.ocrService.extractReceiptData(
      file.buffer,
      useAWS === 'true',
    );
    return result;
  }

  @Post('ocr/batch-scan')
  @UseInterceptors(FilesInterceptor('receipts', 10))
  async batchScanReceipts(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    const buffers = files.map((f) => f.buffer);
    const results = await this.ocrService.batchExtract(buffers);
    return results;
  }

  @Post('ocr')
  async createOcrExtraction(@Body() dto: any, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.expensesService.createOcrExtraction(
      companyId,
      dto.receiptS3Key,
      dto.extracted,
      dto.source,
    );
  }

  @Get('ocr/list')
  async getAllOcrExtractions(@Req() req: any) {
    const companyId = req.user.companyId;
    return this.expensesService.findOcrExtractionsByCompany(companyId);
  }

  @Get('ocr/:id')
  async getOcrById(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.expensesService.findOcrById(id, companyId);
  }

  @Put('ocr/:id/mark-processed')
  async markOcrAsProcessed(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.expensesService.markOcrAsProcessed(id, companyId);
  }

  // Payments
  @Post('payments')
  async createPayment(@Body() dto: CreatePaymentDto, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.paymentsService.createPayment(companyId, dto);
  }

  @Get('payments')
  async getAllPayments(@Query() filters: any, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.paymentsService.findAllByCompany(companyId, filters);
  }

  @Get('payments/:id')
  async getPaymentById(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user.companyId;
    return this.paymentsService.findById(id, companyId);
  }

  @Put('payments/:id')
  async updatePayment(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDto,
    @Req() req: any,
  ) {
    const companyId = req.user.companyId;
    return this.paymentsService.updatePayment(id, companyId, dto);
  }

  @Delete('payments/:id')
  async deletePayment(@Param('id') id: string, @Req() req: any) {
    const companyId = req.user.companyId;
    const success = await this.paymentsService.deletePayment(id, companyId);
    return { success };
  }

  @Get('payments-stats/summary')
  async getPaymentStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: any,
  ) {
    const companyId = req.user.companyId;
    return this.paymentsService.getPaymentStats(
      companyId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('payments-stats/by-method')
  async getPaymentsByMethod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Req() req: any,
  ) {
    const companyId = req.user.companyId;
    return this.paymentsService.getPaymentsByMethod(
      companyId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
