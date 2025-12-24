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
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailIntegrationService } from './email-integration.service';
import { EmailPollingService } from './email-polling.service';
import { CreateEmailIntegrationDto } from './dto/create-email-integration.dto';
import { UpdateEmailIntegrationDto } from './dto/update-email-integration.dto';

@ApiTags('Email Integration')
@Controller('email-integration')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmailIntegrationController {
  constructor(
    private readonly emailIntegrationService: EmailIntegrationService,
    private readonly emailPollingService: EmailPollingService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create email integration',
    description: 'Setup email integration for a company (SaaS model - client provides their email credentials)',
  })
  @ApiResponse({ status: 201, description: 'Email integration created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or email already registered' })
  async create(
    @Body() createDto: CreateEmailIntegrationDto,
    @Request() req,
  ): Promise<any> {
    const userId = req.user.userId;
    return this.emailIntegrationService.create(createDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all email integrations',
    description: 'List all email integrations, optionally filtered by company',
  })
  @ApiQuery({ name: 'company_id', required: false, description: 'Filter by company ID' })
  @ApiResponse({ status: 200, description: 'Email integrations retrieved' })
  async findAll(@Query('company_id') companyId?: string): Promise<any> {
    const companyIdNum = companyId ? parseInt(companyId) : undefined;
    return this.emailIntegrationService.findAll(companyIdNum);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get email integration by ID',
    description: 'Retrieve details of a specific email integration',
  })
  @ApiResponse({ status: 200, description: 'Email integration retrieved' })
  @ApiResponse({ status: 404, description: 'Email integration not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.emailIntegrationService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update email integration',
    description: 'Update email integration settings or credentials',
  })
  @ApiResponse({ status: 200, description: 'Email integration updated' })
  @ApiResponse({ status: 404, description: 'Email integration not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateEmailIntegrationDto,
    @Request() req,
  ): Promise<any> {
    const userId = req.user.userId;
    return this.emailIntegrationService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete (deactivate) email integration',
    description: 'Soft delete - deactivates the integration',
  })
  @ApiResponse({ status: 200, description: 'Email integration deactivated' })
  @ApiResponse({ status: 404, description: 'Email integration not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.emailIntegrationService.remove(id);
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Activate email integration',
    description: 'Re-activate a deactivated integration',
  })
  @ApiResponse({ status: 200, description: 'Email integration activated' })
  async activate(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.emailIntegrationService.activate(id);
  }

  @Post(':id/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Test email connection',
    description: 'Test IMAP and SMTP connectivity for an integration',
  })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  async testConnection(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.emailIntegrationService.testConnection(id);
  }

  @Get(':id/bookings')
  @ApiOperation({
    summary: 'Get email booking history',
    description: 'List all email bookings processed for this integration',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results', example: 50 })
  @ApiResponse({ status: 200, description: 'Email bookings retrieved' })
  async getEmailBookings(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
  ): Promise<any> {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.emailIntegrationService.getEmailBookings(id, limitNum);
  }

  @Post(':id/poll')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually trigger email polling',
    description: 'Force poll emails for this integration (for testing)',
  })
  @ApiResponse({ status: 200, description: 'Polling completed' })
  async pollNow(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.emailPollingService.pollNow(id);
  }
}
