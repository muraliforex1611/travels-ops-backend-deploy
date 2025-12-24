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
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountsService } from './accounts.service';
import { CreateIncomeDto, UpdateIncomeDto } from './dto/income.dto';
import { CreateExpenseDto } from './dto/expense.dto';

@ApiTags('Accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  // =====================================================================
  // INCOME ENDPOINTS
  // =====================================================================

  @Post('income')
  @ApiOperation({
    summary: 'Create income transaction',
    description: 'Record income (trip fare, advance, rental, etc.) with auto GST calculation',
  })
  @ApiResponse({ status: 201, description: 'Income transaction created successfully' })
  async createIncome(
    @Body() createDto: CreateIncomeDto,
    @Request() req,
  ): Promise<any> {
    const userId = req.user.userId;
    return this.accountsService.createIncome(createDto, userId);
  }

  @Get('income')
  @ApiOperation({
    summary: 'Get all income transactions',
    description: 'List income with filters (date range, category, company)',
  })
  @ApiQuery({ name: 'from_date', required: false, example: '2025-12-01' })
  @ApiQuery({ name: 'to_date', required: false, example: '2025-12-31' })
  @ApiQuery({ name: 'category_id', required: false, type: Number })
  @ApiQuery({ name: 'company_id', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Income transactions retrieved' })
  async getIncome(
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
    @Query('category_id') categoryId?: string,
    @Query('company_id') companyId?: string,
  ): Promise<any> {
    const filters: any = {};
    if (fromDate) filters.from_date = fromDate;
    if (toDate) filters.to_date = toDate;
    if (categoryId) filters.category_id = parseInt(categoryId);
    if (companyId) filters.company_id = parseInt(companyId);

    return this.accountsService.getIncomeTransactions(filters);
  }

  // =====================================================================
  // EXPENSE ENDPOINTS
  // =====================================================================

  @Post('expense')
  @ApiOperation({
    summary: 'Create expense transaction',
    description: 'Record expense (fuel, maintenance, salary, etc.) with auto GST calculation',
  })
  @ApiResponse({ status: 201, description: 'Expense transaction created successfully' })
  async createExpense(
    @Body() createDto: CreateExpenseDto,
    @Request() req,
  ): Promise<any> {
    const userId = req.user.userId;
    return this.accountsService.createExpense(createDto, userId);
  }

  @Get('expense')
  @ApiOperation({
    summary: 'Get all expense transactions',
    description: 'List expenses with filters (date range, category, vehicle)',
  })
  @ApiQuery({ name: 'from_date', required: false, example: '2025-12-01' })
  @ApiQuery({ name: 'to_date', required: false, example: '2025-12-31' })
  @ApiQuery({ name: 'category_id', required: false, type: Number })
  @ApiQuery({ name: 'vehicle_id', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Expense transactions retrieved' })
  async getExpense(
    @Query('from_date') fromDate?: string,
    @Query('to_date') toDate?: string,
    @Query('category_id') categoryId?: string,
    @Query('vehicle_id') vehicleId?: string,
  ): Promise<any> {
    const filters: any = {};
    if (fromDate) filters.from_date = fromDate;
    if (toDate) filters.to_date = toDate;
    if (categoryId) filters.category_id = parseInt(categoryId);
    if (vehicleId) filters.vehicle_id = parseInt(vehicleId);

    return this.accountsService.getExpenseTransactions(filters);
  }

  // =====================================================================
  // DAY BOOK
  // =====================================================================

  @Get('daybook')
  @ApiOperation({
    summary: 'Get day book',
    description: 'Combined income + expense for date range with profit/loss calculation',
  })
  @ApiQuery({ name: 'from_date', required: true, example: '2025-12-01' })
  @ApiQuery({ name: 'to_date', required: true, example: '2025-12-31' })
  @ApiResponse({ status: 200, description: 'Day book retrieved' })
  async getDayBook(
    @Query('from_date') fromDate: string,
    @Query('to_date') toDate: string,
  ): Promise<any> {
    return this.accountsService.getDayBook(fromDate, toDate);
  }

  // =====================================================================
  // REPORTS
  // =====================================================================

  @Get('monthly-summary/:year')
  @ApiOperation({
    summary: 'Get monthly summary',
    description: 'Month-wise income, expense, profit for entire year',
  })
  @ApiResponse({ status: 200, description: 'Monthly summary retrieved' })
  async getMonthlySummary(
    @Param('year', ParseIntPipe) year: number,
  ): Promise<any> {
    return this.accountsService.getMonthlySummary(year);
  }

  @Get('balance-sheet/:year')
  @ApiOperation({
    summary: 'Get yearly balance sheet',
    description: 'Complete P&L statement with category-wise breakdown',
  })
  @ApiResponse({ status: 200, description: 'Balance sheet retrieved' })
  async getBalanceSheet(
    @Param('year', ParseIntPipe) year: number,
  ): Promise<any> {
    return this.accountsService.getYearlyBalanceSheet(year);
  }

  @Get('gst-report/:year/:month')
  @ApiOperation({
    summary: 'Get GST report',
    description: 'Monthly GST collected, paid, and payable with CGST/SGST/IGST breakdown',
  })
  @ApiResponse({ status: 200, description: 'GST report retrieved' })
  async getGSTReport(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ): Promise<any> {
    return this.accountsService.getGSTReport(month, year);
  }

  // =====================================================================
  // DASHBOARD
  // =====================================================================

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get accounts dashboard',
    description: 'Real-time summary: today, this month, pending EMIs, pending salaries',
  })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved' })
  async getDashboard(): Promise<any> {
    return this.accountsService.getDashboard();
  }

  // =====================================================================
  // CATEGORIES
  // =====================================================================

  @Get('income-categories')
  @ApiOperation({
    summary: 'Get all income categories',
    description: 'List all active income categories',
  })
  @ApiResponse({ status: 200, description: 'Income categories retrieved' })
  async getIncomeCategories(): Promise<any> {
    // TODO: Implement in service
    return { success: true, message: 'Income categories endpoint' };
  }

  @Get('expense-categories')
  @ApiOperation({
    summary: 'Get all expense categories',
    description: 'List all active expense categories',
  })
  @ApiResponse({ status: 200, description: 'Expense categories retrieved' })
  async getExpenseCategories(): Promise<any> {
    // TODO: Implement in service
    return { success: true, message: 'Expense categories endpoint' };
  }
}
