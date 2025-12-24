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
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiExcludeEndpoint } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WhatsappIntegrationService } from './whatsapp-integration.service';
import { WhatsappWebhookService } from './whatsapp-webhook.service';
import { CreateWhatsappIntegrationDto } from './dto/create-whatsapp-integration.dto';
import { UpdateWhatsappIntegrationDto } from './dto/update-whatsapp-integration.dto';

@ApiTags('WhatsApp Integration')
@Controller('whatsapp-integration')
export class WhatsappIntegrationController {
  constructor(
    private readonly whatsappIntegrationService: WhatsappIntegrationService,
    private readonly whatsappWebhookService: WhatsappWebhookService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create WhatsApp integration',
    description: 'Setup WhatsApp integration for a company (SaaS model - client provides their WhatsApp Business credentials)',
  })
  @ApiResponse({ status: 201, description: 'WhatsApp integration created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or number already registered' })
  async create(
    @Body() createDto: CreateWhatsappIntegrationDto,
    @Request() req,
  ): Promise<any> {
    const userId = req.user.userId;
    return this.whatsappIntegrationService.create(createDto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all WhatsApp integrations',
    description: 'List all WhatsApp integrations, optionally filtered by company',
  })
  @ApiQuery({ name: 'company_id', required: false, description: 'Filter by company ID' })
  @ApiResponse({ status: 200, description: 'WhatsApp integrations retrieved' })
  async findAll(@Query('company_id') companyId?: string): Promise<any> {
    const companyIdNum = companyId ? parseInt(companyId) : undefined;
    return this.whatsappIntegrationService.findAll(companyIdNum);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get WhatsApp integration by ID',
    description: 'Retrieve details of a specific WhatsApp integration',
  })
  @ApiResponse({ status: 200, description: 'WhatsApp integration retrieved' })
  @ApiResponse({ status: 404, description: 'WhatsApp integration not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.whatsappIntegrationService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update WhatsApp integration',
    description: 'Update WhatsApp integration settings or credentials',
  })
  @ApiResponse({ status: 200, description: 'WhatsApp integration updated' })
  @ApiResponse({ status: 404, description: 'WhatsApp integration not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateWhatsappIntegrationDto,
    @Request() req,
  ): Promise<any> {
    const userId = req.user.userId;
    return this.whatsappIntegrationService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete (deactivate) WhatsApp integration',
    description: 'Soft delete - deactivates the integration',
  })
  @ApiResponse({ status: 200, description: 'WhatsApp integration deactivated' })
  @ApiResponse({ status: 404, description: 'WhatsApp integration not found' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.whatsappIntegrationService.remove(id);
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Activate WhatsApp integration',
    description: 'Re-activate a deactivated integration',
  })
  @ApiResponse({ status: 200, description: 'WhatsApp integration activated' })
  async activate(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.whatsappIntegrationService.activate(id);
  }

  @Get(':id/bookings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get WhatsApp booking history',
    description: 'List all WhatsApp bookings processed for this integration',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit results', example: 50 })
  @ApiResponse({ status: 200, description: 'WhatsApp bookings retrieved' })
  async getWhatsappBookings(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: string,
  ): Promise<any> {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.whatsappIntegrationService.getWhatsappBookings(id, limitNum);
  }

  /**
   * WhatsApp Webhook Endpoint (GET) - For verification
   */
  @Get('webhook/verify')
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
  ): Promise<any> {
    // TODO: Verify token against stored webhook_verify_token
    if (mode === 'subscribe' && verifyToken) {
      return challenge;
    }
    return { error: 'Verification failed' };
  }

  /**
   * WhatsApp Webhook Endpoint (POST) - For receiving messages
   */
  @Post('webhook')
  @ApiExcludeEndpoint()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() webhookData: any): Promise<any> {
    // Process webhook in background
    this.whatsappWebhookService.handleWebhook(webhookData).catch((error) => {
      console.error('Webhook processing failed:', error);
    });

    // Immediately return 200 to Meta
    return { status: 'received' };
  }
}
