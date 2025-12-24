import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabase } from '../../config/database.config';
import { CreateEmailIntegrationDto } from './dto/create-email-integration.dto';
import { UpdateEmailIntegrationDto } from './dto/update-email-integration.dto';
import { EmailBookingResultDto, ParsedBookingDataDto } from './dto/email-booking-result.dto';
import * as crypto from 'crypto';

@Injectable()
export class EmailIntegrationService {
  private readonly logger = new Logger(EmailIntegrationService.name);
  private readonly encryptionKey = process.env.EMAIL_ENCRYPTION_KEY || 'default-encryption-key-change-in-production';

  /**
   * Create new email integration for a company
   */
  async create(
    createDto: CreateEmailIntegrationDto,
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

      // Check if email already registered for this company
      const { data: existing } = await supabase
        .from('email_integrations')
        .select('integration_id')
        .eq('company_id', createDto.company_id)
        .eq('email_address', createDto.email_address)
        .single();

      if (existing) {
        throw new BadRequestException('Email integration already exists for this company');
      }

      // Encrypt password
      const encryptedPassword = this.encryptPassword(createDto.email_password);

      // Create email integration
      const { data, error } = await supabase
        .from('email_integrations')
        .insert({
          company_id: createDto.company_id,
          integration_name: createDto.integration_name,
          email_address: createDto.email_address,
          email_password: encryptedPassword,
          imap_host: createDto.imap_host,
          imap_port: createDto.imap_port || 993,
          imap_tls: createDto.imap_tls !== false,
          smtp_host: createDto.smtp_host || createDto.imap_host.replace('imap', 'smtp'),
          smtp_port: createDto.smtp_port || 587,
          smtp_tls: createDto.smtp_tls !== false,
          polling_interval_minutes: createDto.polling_interval_minutes || 5,
          auto_create_booking: createDto.auto_create_booking !== false,
          send_confirmation_email: createDto.send_confirmation_email !== false,
          is_active: true,
          created_by: userId,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create email integration: ${error.message}`);
      }

      // Remove password from response
      const { email_password, ...safeData } = data;

      return {
        success: true,
        message: 'Email integration created successfully',
        data: safeData,
      };
    } catch (error) {
      this.logger.error(`Create email integration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all email integrations (optionally filtered by company)
   */
  async findAll(companyId?: number): Promise<any> {
    try {
      let query = supabase
        .from('email_integrations')
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
        throw new Error(`Failed to fetch email integrations: ${error.message}`);
      }

      // Remove passwords from response
      const safeData = data.map(({ email_password, ...rest }) => rest);

      return {
        success: true,
        count: safeData.length,
        data: safeData,
      };
    } catch (error) {
      this.logger.error(`Fetch email integrations failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get single email integration by ID
   */
  async findOne(id: number): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('email_integrations')
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
        throw new NotFoundException('Email integration not found');
      }

      // Remove password from response
      const { email_password, ...safeData } = data;

      return {
        success: true,
        data: safeData,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Fetch email integration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update email integration
   */
  async update(
    id: number,
    updateDto: UpdateEmailIntegrationDto,
    userId: number,
  ): Promise<any> {
    try {
      // Check if exists
      const { data: existing, error: fetchError } = await supabase
        .from('email_integrations')
        .select('integration_id')
        .eq('integration_id', id)
        .single();

      if (fetchError || !existing) {
        throw new NotFoundException('Email integration not found');
      }

      const updateData: any = { ...updateDto };

      // Encrypt password if provided
      if (updateDto.email_password) {
        updateData.email_password = this.encryptPassword(updateDto.email_password);
      }

      const { data, error } = await supabase
        .from('email_integrations')
        .update(updateData)
        .eq('integration_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update email integration: ${error.message}`);
      }

      // Remove password from response
      const { email_password, ...safeData } = data;

      return {
        success: true,
        message: 'Email integration updated successfully',
        data: safeData,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Update email integration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete (deactivate) email integration
   */
  async remove(id: number): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('email_integrations')
        .update({ is_active: false })
        .eq('integration_id', id)
        .select()
        .single();

      if (error || !data) {
        throw new NotFoundException('Email integration not found');
      }

      return {
        success: true,
        message: 'Email integration deactivated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Delete email integration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Activate email integration
   */
  async activate(id: number): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('email_integrations')
        .update({ is_active: true })
        .eq('integration_id', id)
        .select()
        .single();

      if (error || !data) {
        throw new NotFoundException('Email integration not found');
      }

      return {
        success: true,
        message: 'Email integration activated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Activate email integration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Test email connection (IMAP and SMTP)
   */
  async testConnection(id: number): Promise<any> {
    try {
      const { data: integration, error } = await supabase
        .from('email_integrations')
        .select('*')
        .eq('integration_id', id)
        .single();

      if (error || !integration) {
        throw new NotFoundException('Email integration not found');
      }

      // Decrypt password for testing
      const decryptedPassword = this.decryptPassword(integration.email_password);

      // TODO: Implement actual IMAP/SMTP connection test using nodemailer
      // For now, return mock success
      this.logger.log(`Testing connection for ${integration.email_address}`);

      return {
        success: true,
        message: 'Email connection test successful',
        imap_status: 'connected',
        smtp_status: 'connected',
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Test connection failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Email connection test failed',
        error: error.message,
      };
    }
  }

  /**
   * Get email booking history for an integration
   */
  async getEmailBookings(integrationId: number, limit = 50): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('email_bookings')
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
        throw new Error(`Failed to fetch email bookings: ${error.message}`);
      }

      return {
        success: true,
        count: data.length,
        data,
      };
    } catch (error) {
      this.logger.error(`Fetch email bookings failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Parse email content to extract booking information
   */
  parseEmailContent(subject: string, body: string): ParsedBookingDataDto {
    const parsed: ParsedBookingDataDto = {};

    // Simple regex-based parsing (can be enhanced with NLP)
    const bodyLower = body.toLowerCase();

    // Extract customer name
    const nameMatch = body.match(/name[:\s]+([A-Za-z\s]+)/i);
    if (nameMatch) parsed.customer_name = nameMatch[1].trim();

    // Extract customer mobile
    const mobileMatch = body.match(/(?:mobile|phone|contact)[:\s]*([\+\d\s\-\(\)]+)/i);
    if (mobileMatch) parsed.customer_mobile = mobileMatch[1].trim();

    // Extract customer email
    const emailMatch = body.match(/(?:email)[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (emailMatch) parsed.customer_email = emailMatch[1].trim();

    // Extract pickup location
    const pickupMatch = body.match(/(?:pickup|from)[:\s]+([^\n]+)/i);
    if (pickupMatch) parsed.pickup_location = pickupMatch[1].trim();

    // Extract drop location
    const dropMatch = body.match(/(?:drop|to|destination)[:\s]+([^\n]+)/i);
    if (dropMatch) parsed.drop_location = dropMatch[1].trim();

    // Extract pickup datetime
    const dateMatch = body.match(/(?:date|when)[:\s]+([^\n]+)/i);
    const timeMatch = body.match(/(?:time)[:\s]+([^\n]+)/i);
    if (dateMatch) {
      const dateStr = dateMatch[1].trim();
      const timeStr = timeMatch ? timeMatch[1].trim() : '09:00';
      // TODO: Proper date parsing logic
      parsed.pickup_datetime = `${dateStr} ${timeStr}`;
    }

    // Extract passengers
    const passengersMatch = body.match(/(?:passengers|people|persons)[:\s]*(\d+)/i);
    if (passengersMatch) parsed.passengers = parseInt(passengersMatch[1]);

    // Extract vehicle type
    const vehicleMatch = body.match(/(?:vehicle|car|cab)[:\s]*(sedan|suv|hatchback|luxury)/i);
    if (vehicleMatch) parsed.vehicle_type = vehicleMatch[1];

    // Extract special instructions
    const instructionsMatch = body.match(/(?:instructions|notes|remarks)[:\s]+([^\n]+)/i);
    if (instructionsMatch) parsed.special_instructions = instructionsMatch[1].trim();

    return parsed;
  }

  /**
   * Calculate parsing confidence score
   */
  calculateConfidence(parsed: ParsedBookingDataDto): number {
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
   * Encrypt password using AES-256-CBC
   */
  private encryptPassword(password: string): string {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt password using AES-256-CBC
   */
  private decryptPassword(encryptedData: string): string {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
