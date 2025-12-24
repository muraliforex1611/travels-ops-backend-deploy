// =====================================================================
// Companies Controller
// =====================================================================

import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateCreditDto } from './dto/update-credit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Companies')
@Controller('companies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  // ========================================
  // CREATE COMPANY
  // ========================================
  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully',
  })
  @ApiResponse({ status: 409, description: 'Company code already exists' })
  async create(@Body() createCompanyDto: CreateCompanyDto, @Request() req) {
    const userId = req.user?.userId;
    return this.companiesService.create(createCompanyDto, userId);
  }

  // ========================================
  // GET ALL COMPANIES
  // ========================================
  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiQuery({
    name: 'is_active',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'has_credit_limit',
    required: false,
    type: Boolean,
    description: 'Filter companies with credit limit',
  })
  @ApiQuery({
    name: 'email_domain',
    required: false,
    type: String,
    description: 'Filter by email domain',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name, code, or contact person',
  })
  @ApiResponse({ status: 200, description: 'Companies retrieved successfully' })
  async findAll(
    @Query('is_active') is_active?: string,
    @Query('has_credit_limit') has_credit_limit?: string,
    @Query('email_domain') email_domain?: string,
    @Query('search') search?: string,
  ) {
    const filters: any = {};

    if (is_active !== undefined) {
      filters.is_active = is_active === 'true';
    }

    if (has_credit_limit !== undefined) {
      filters.has_credit_limit = has_credit_limit === 'true';
    }

    if (email_domain) {
      filters.email_domain = email_domain;
    }

    if (search) {
      filters.search = search;
    }

    return this.companiesService.findAll(filters);
  }

  // ========================================
  // GET COMPANY BY ID
  // ========================================
  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({ status: 200, description: 'Company found' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.findOne(id);
  }

  // ========================================
  // GET COMPANY BY CODE
  // ========================================
  @Get('code/:companyCode')
  @ApiOperation({ summary: 'Get company by company code' })
  @ApiResponse({ status: 200, description: 'Company found' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findByCode(@Param('companyCode') companyCode: string) {
    return this.companiesService.findByCode(companyCode);
  }

  // ========================================
  // LOOKUP COMPANY BY EMAIL
  // ========================================
  @Get('lookup/email')
  @ApiOperation({
    summary: 'Find company by email domain',
    description: 'Used for auto-detecting company from email address',
  })
  @ApiQuery({
    name: 'email',
    required: true,
    type: String,
    description: 'Email address to lookup',
    example: 'john@infosys.com',
  })
  @ApiResponse({ status: 200, description: 'Company found or not found' })
  async findByEmail(@Query('email') email: string) {
    return this.companiesService.findByEmailDomain(email);
  }

  // ========================================
  // UPDATE COMPANY
  // ========================================
  @Put(':id')
  @ApiOperation({ summary: 'Update company details' })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 409, description: 'Conflict with existing data' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  // ========================================
  // UPDATE CREDIT
  // ========================================
  @Patch(':id/credit')
  @ApiOperation({
    summary: 'Update company credit limit or outstanding amount',
  })
  @ApiResponse({ status: 200, description: 'Credit updated successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({
    status: 400,
    description: 'Invalid credit adjustment',
  })
  async updateCredit(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCreditDto: UpdateCreditDto,
  ) {
    return this.companiesService.updateCredit(id, updateCreditDto);
  }

  // ========================================
  // CHECK CREDIT AVAILABILITY
  // ========================================
  @Get(':id/credit/check')
  @ApiOperation({
    summary: 'Check if company has sufficient credit for a booking',
  })
  @ApiQuery({
    name: 'amount',
    required: true,
    type: Number,
    description: 'Requested booking amount',
  })
  @ApiResponse({ status: 200, description: 'Credit check completed' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async checkCredit(
    @Param('id', ParseIntPipe) id: number,
    @Query('amount', ParseIntPipe) amount: number,
  ) {
    return this.companiesService.checkCreditAvailability(id, amount);
  }

  // ========================================
  // DEACTIVATE COMPANY
  // ========================================
  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a company' })
  @ApiResponse({ status: 200, description: 'Company deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.deactivate(id);
  }

  // ========================================
  // ACTIVATE COMPANY
  // ========================================
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate a company' })
  @ApiResponse({ status: 200, description: 'Company activated successfully' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async activate(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.activate(id);
  }

  // ========================================
  // GET COMPANY BOOKINGS
  // ========================================
  @Get(':id/bookings')
  @ApiOperation({ summary: 'Get all bookings for a company' })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by booking status',
  })
  @ApiQuery({
    name: 'from_date',
    required: false,
    type: String,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'to_date',
    required: false,
    type: String,
    description: 'End date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of records',
  })
  @ApiResponse({
    status: 200,
    description: 'Company bookings retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getBookings(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') status?: string,
    @Query('from_date') from_date?: string,
    @Query('to_date') to_date?: string,
    @Query('limit') limit?: string,
  ) {
    const filters: any = {};

    if (status) filters.status = status;
    if (from_date) filters.from_date = from_date;
    if (to_date) filters.to_date = to_date;
    if (limit) filters.limit = parseInt(limit);

    return this.companiesService.getCompanyBookings(id, filters);
  }

  // ========================================
  // GET COMPANY STATISTICS
  // ========================================
  @Get(':id/statistics')
  @ApiOperation({
    summary: 'Get company booking statistics',
    description: 'Get monthly/yearly statistics for a company',
  })
  @ApiQuery({
    name: 'month',
    required: false,
    type: String,
    description: 'Month (1-12)',
    example: '12',
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: String,
    description: 'Year (YYYY)',
    example: '2025',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async getStatistics(
    @Param('id', ParseIntPipe) id: number,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.companiesService.getCompanyStats(id, month, year);
  }
}
