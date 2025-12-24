import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabase } from '../../config/database.config';
import { CreateWhatsappIntegrationDto } from './dto/create-whatsapp-integration.dto';
import { UpdateWhatsappIntegrationDto } from './dto/update-whatsapp-integration.dto';
import { ParsedWhatsappDataDto } from './dto/whatsapp-webhook.dto';
import * as crypto from 'crypto';

@Injectable()
export class WhatsappIntegrationService {
  private readonly logger = new Logger(WhatsappIntegrationService.name);
  private readonly encryptionKey = process.env.WHATSAPP_ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

  /**
   * Create new WhatsApp integration for a company
   */
  async create(
    createDto: CreateWhatsappIntegrationDto,
    userId: number,
  ): Promise<any> {
    try {
      // Check if company exists
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('company_id, company_name')
        .eq('company_id', createDto.company_id)
        .single();

      if (companyError || !company) {
        throw new NotFoundException('Company not found');
      }

      // Check if phone number already registered
      const { data: existing } = await supabase
        .from('whatsapp_integrations')
        .select('integration_id')
        .eq('phone_number', createDto.phone_number)
        .single();

      if (existing) {
        throw new BadRequestException('WhatsApp number already registered');
      }

      // Encrypt access token
      const encryptedToken = this.encryptToken(createDto.access_token);

      // Create WhatsApp integration
      const { data, error } = await supabase
        .from('whatsapp_integrations')
        .insert({
          company_id: createDto.company_id,
          integration_name: createDto.integration_name,
          phone_number: createDto.phone_number,
          business_account_id: createDto.business_account_id,
          phone_number_id: createDto.phone_number_id,
          access_token: encryptedToken,
          webhook_verify_token: createDto.webhook_verify_token,
          api_version: createDto.api_version || 'v18.0',
          auto_create_booking: createDto.auto_create_booking !== false,
          send_confirmation_message: createDto.send_confirmation_message !== false,
          enable_interactive_menu: createDto.enable_interactive_menu !== false,
          is_active: true,
          created_by: userId,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create WhatsApp integration: ${error.message}`);
      }

      // Remove sensitive data from response
      const { access_token, ...safeData } = data;

      return {
        success: true,
        message: 'WhatsApp integration created successfully',
        data: safeData,
      };
    } catch (error) {
      this.logger.error(`Create WhatsApp integration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all WhatsApp integrations (optionally filtered by company)
   */
  async findAll(companyId?: number): Promise<any> {
    try {
      let query = supabase
        .from('whatsapp_integrations')
        .select(`
          *,
          companies (
            company_id,
            company_name,
            company_code
          )
        `)
        .order('created_at', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch WhatsApp integrations: ${error.message}`);
      }

      // Remove access tokens from response
      const safeData = data.map(({ access_token, ...rest }) => rest);

      return {
        success: true,
        count: safeData.length,
        data: safeData,
      };
    } catch (error) {
      this.logger.error(`Fetch WhatsApp integrations failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get single WhatsApp integration by ID
   */
  async findOne(id: number): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_integrations')
        .select(`
          *,
          companies (
            company_id,
            company_name,
            company_code
          )
        `)
        .eq('integration_id', id)
        .single();

      if (error || !data) {
        throw new NotFoundException('WhatsApp integration not found');
      }

      // Remove access token from response
      const { access_token, ...safeData } = data;

      return {
        success: true,
        data: safeData,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Fetch WhatsApp integration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find integration by phone number (for webhook processing)
   */
  async findByPhoneNumberId(phoneNumberId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_integrations')
        .select('*')
        .eq('phone_number_id', phoneNumberId)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      return data;
    } catch (error) {
      this.logger.error(`Find by phone number ID failed: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Update WhatsApp integration
   */
  async update(
    id: number,
    updateDto: UpdateWhatsappIntegrationDto,
    userId: number,
  ): Promise<any> {
    try {
      // Check if exists
      const { data: existing, error: fetchError } = await supabase
        .from('whatsapp_integrations')
        .select('integration_id')
        .eq('integration_id', id)
        .single();

      if (fetchError || !existing) {
        throw new NotFoundException('WhatsApp integration not found');
      }

      const updateData: any = { ...updateDto };

      // Encrypt access token if provided
      if (updateDto.access_token) {
        updateData.access_token = this.encryptToken(updateDto.access_token);
      }

      const { data, error } = await supabase
        .from('whatsapp_integrations')
        .update(updateData)
        .eq('integration_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update WhatsApp integration: ${error.message}`);
      }

      // Remove access token from response
      const { access_token, ...safeData } = data;

      return {
        success: true,
        message: 'WhatsApp integration updated successfully',
        data: safeData,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Update WhatsApp integration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete (deactivate) WhatsApp integration
   */
  async remove(id: number): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_integrations')
        .update({ is_active: false })
        .eq('integration_id', id)
        .select()
        .single();

      if (error || !data) {
        throw new NotFoundException('WhatsApp integration not found');
      }

      return {
        success: true,
        message: 'WhatsApp integration deactivated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Delete WhatsApp integration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Activate WhatsApp integration
   */
  async activate(id: number): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_integrations')
        .update({ is_active: true })
        .eq('integration_id', id)
        .select()
        .single();

      if (error || !data) {
        throw new NotFoundException('WhatsApp integration not found');
      }

      return {
        success: true,
        message: 'WhatsApp integration activated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Activate WhatsApp integration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get WhatsApp booking history for an integration
   */
  async getWhatsappBookings(integrationId: number, limit = 50): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_bookings')
        .select(`
          *,
          bookings (
            booking_id,
            booking_code,
            status,
            customer_name,
            pickup_location
          )
        `)
        .eq('integration_id', integrationId)
        .order('received_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch WhatsApp bookings: ${error.message}`);
      }

      return {
        success: true,
        count: data.length,
        data,
      };
    } catch (error) {
      this.logger.error(`Fetch WhatsApp bookings failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Parse WhatsApp message content to extract booking information
   */
  parseMessageContent(messageText: string): ParsedWhatsappDataDto {
    const parsed: ParsedWhatsappDataDto = {};

    // Simple regex-based parsing (similar to email parsing)
    const textLower = messageText.toLowerCase();

    // Extract customer name
    const nameMatch = messageText.match(/(?:name|naam)[:\s]+([A-Za-z\s]+)/i);
    if (nameMatch) parsed.customer_name = nameMatch[1].trim();

    // Extract customer mobile
    const mobileMatch = messageText.match(/(?:mobile|phone|contact|number)[:\s]*([\+\d\s\-\(\)]+)/i);
    if (mobileMatch) parsed.customer_mobile = mobileMatch[1].trim();

    // Extract pickup location
    const pickupMatch = messageText.match(/(?:pickup|from)[:\s]+([^\n]+)/i);
    if (pickupMatch) parsed.pickup_location = pickupMatch[1].trim();

    // Extract drop location
    const dropMatch = messageText.match(/(?:drop|to|destination)[:\s]+([^\n]+)/i);
    if (dropMatch) parsed.drop_location = dropMatch[1].trim();

    // Extract pickup datetime
    const dateMatch = messageText.match(/(?:date|when)[:\s]+([^\n]+)/i);
    const timeMatch = messageText.match(/(?:time)[:\s]+([^\n]+)/i);
    if (dateMatch) {
      const dateStr = dateMatch[1].trim();
      const timeStr = timeMatch ? timeMatch[1].trim() : '09:00';
      parsed.pickup_datetime = `${dateStr} ${timeStr}`;
    }

    // Extract passengers
    const passengersMatch = messageText.match(/(?:passengers|people|persons)[:\s]*(\d+)/i);
    if (passengersMatch) parsed.passengers = parseInt(passengersMatch[1]);

    // Extract vehicle type
    const vehicleMatch = messageText.match(/(?:vehicle|car|cab)[:\s]*(sedan|suv|hatchback|luxury)/i);
    if (vehicleMatch) parsed.vehicle_type = vehicleMatch[1];

    // Extract special instructions
    const instructionsMatch = messageText.match(/(?:instructions|notes|remarks)[:\s]+([^\n]+)/i);
    if (instructionsMatch) parsed.special_instructions = instructionsMatch[1].trim();

    return parsed;
  }

  /**
   * Calculate parsing confidence score
   */
  calculateConfidence(parsed: ParsedWhatsappDataDto): number {
    let score = 0;
    const weights = {
      pickup_location: 25,
      drop_location: 25,
      pickup_datetime: 20,
      customer_mobile: 15,
      customer_name: 10,
      passengers: 5,
    };

    if (parsed.pickup_location) score += weights.pickup_location;
    if (parsed.drop_location) score += weights.drop_location;
    if (parsed.pickup_datetime) score += weights.pickup_datetime;
    if (parsed.customer_mobile) score += weights.customer_mobile;
    if (parsed.customer_name) score += weights.customer_name;
    if (parsed.passengers) score += weights.passengers;

    return score;
  }

  /**
   * Get decrypted access token (for internal use only)
   */
  getDecryptedToken(integration: any): string {
    return this.decryptToken(integration.access_token);
  }

  /**
   * Encrypt access token using AES-256-CBC
   */
  private encryptToken(token: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt access token using AES-256-CBC
   */
  private decryptToken(encryptedData: string): string {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
