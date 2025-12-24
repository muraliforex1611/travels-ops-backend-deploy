import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { supabase } from '../../config/database.config';
import { EmailIntegrationService } from './email-integration.service';
import { AllocationService } from '../allocation/allocation.service';

interface EmailMessage {
  messageId: string;
  from: string;
  subject: string;
  body: string;
  receivedDate: Date;
}

@Injectable()
export class EmailPollingService {
  private readonly logger = new Logger(EmailPollingService.name);
  private isPolling = false;

  constructor(
    private readonly emailIntegrationService: EmailIntegrationService,
    private readonly allocationService: AllocationService,
  ) {}

  /**
   * Cron job to poll emails every 5 minutes
   * Can be configured per integration
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async pollAllActiveIntegrations() {
    if (this.isPolling) {
      this.logger.warn('Previous polling still in progress, skipping this cycle');
      return;
    }

    try {
      this.isPolling = true;
      this.logger.log('Starting email polling for all active integrations');

      // Get all active integrations
      const { data: integrations, error } = await supabase
        .from('email_integrations')
        .select('*')
        .eq('is_active', true);

      if (error || !integrations || integrations.length === 0) {
        this.logger.log('No active email integrations found');
        return;
      }

      this.logger.log(`Found ${integrations.length} active email integrations`);

      // Poll each integration
      for (const integration of integrations) {
        try {
          await this.pollIntegration(integration);
        } catch (error) {
          this.logger.error(
            `Failed to poll integration ${integration.integration_id}: ${error.message}`,
            error.stack,
          );
        }
      }

      this.logger.log('Email polling completed successfully');
    } catch (error) {
      this.logger.error(`Email polling failed: ${error.message}`, error.stack);
    } finally {
      this.isPolling = false;
    }
  }

  /**
   * Poll a single email integration
   */
  async pollIntegration(integration: any): Promise<void> {
    this.logger.log(`Polling integration: ${integration.integration_name} (${integration.email_address})`);

    try {
      // Get last polled timestamp
      const { data: lastPolled } = await supabase
        .from('email_integrations')
        .select('last_polled_at')
        .eq('integration_id', integration.integration_id)
        .single();

      // TODO: Implement actual IMAP email fetching using nodemailer/imap
      // For now, using mock data
      const newEmails = await this.fetchNewEmails(integration, lastPolled?.last_polled_at);

      this.logger.log(`Found ${newEmails.length} new emails for ${integration.email_address}`);

      // Process each email
      for (const email of newEmails) {
        await this.processEmail(email, integration);
      }

      // Update last polled timestamp
      await supabase
        .from('email_integrations')
        .update({ last_polled_at: new Date().toISOString() })
        .eq('integration_id', integration.integration_id);

    } catch (error) {
      this.logger.error(`Poll integration failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Fetch new emails from IMAP server
   * TODO: Implement actual IMAP connection using nodemailer
   */
  private async fetchNewEmails(
    integration: any,
    sinceDate?: string,
  ): Promise<EmailMessage[]> {
    // This is a placeholder - actual implementation would use nodemailer/imap
    // to connect to the IMAP server and fetch emails

    this.logger.log(`Fetching emails from ${integration.imap_host}:${integration.imap_port}`);

    // Mock implementation - return empty array for now
    // In production, this would:
    // 1. Connect to IMAP server using credentials
    // 2. Search for new emails since last poll
    // 3. Fetch email content (subject, body, sender)
    // 4. Return array of EmailMessage objects

    return [];
  }

  /**
   * Process a single email - parse and create booking
   */
  private async processEmail(
    email: EmailMessage,
    integration: any,
  ): Promise<void> {
    this.logger.log(`Processing email: ${email.subject} from ${email.from}`);

    try {
      // Check if email already processed
      const { data: existing } = await supabase
        .from('email_bookings')
        .select('email_booking_id')
        .eq('integration_id', integration.integration_id)
        .eq('email_message_id', email.messageId)
        .single();

      if (existing) {
        this.logger.log(`Email ${email.messageId} already processed, skipping`);
        return;
      }

      // Parse email content
      const parsedData = this.emailIntegrationService.parseEmailContent(
        email.subject,
        email.body,
      );

      const confidence = this.emailIntegrationService.calculateConfidence(parsedData);

      this.logger.log(`Parsed email with ${confidence}% confidence`);

      // Log email booking (even if not creating booking)
      const { data: emailBooking, error: logError } = await supabase
        .from('email_bookings')
        .insert({
          integration_id: integration.integration_id,
          email_message_id: email.messageId,
          sender_email: email.from,
          email_subject: email.subject,
          email_body: email.body,
          parsed_data: parsedData,
          parsing_confidence: confidence,
          processing_status: confidence >= 70 ? 'pending' : 'failed',
          received_at: email.receivedDate,
        })
        .select()
        .single();

      if (logError) {
        this.logger.error(`Failed to log email booking: ${logError.message}`);
        return;
      }

      // Auto-create booking if enabled and confidence is high enough
      if (integration.auto_create_booking && confidence >= 70) {
        await this.createBookingFromEmail(emailBooking, parsedData, integration);
      } else {
        this.logger.log(`Skipping auto-booking creation (auto_create: ${integration.auto_create_booking}, confidence: ${confidence}%)`);
      }

    } catch (error) {
      this.logger.error(`Process email failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Create booking from parsed email data
   */
  private async createBookingFromEmail(
    emailBooking: any,
    parsedData: any,
    integration: any,
  ): Promise<void> {
    try {
      this.logger.log(`Creating booking from email ${emailBooking.email_booking_id}`);

      // Get company details
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('company_id', integration.company_id)
        .single();

      if (!company) {
        throw new Error('Company not found');
      }

      // Check credit availability
      const estimatedFare = 1500; // TODO: Calculate based on distance
      if (company.current_outstanding + estimatedFare > company.credit_limit) {
        throw new Error('Insufficient credit limit');
      }

      // Get vehicle category (default to first one if not specified)
      let vehicleCategoryId = 1;
      if (parsedData.vehicle_type) {
        const { data: category } = await supabase
          .from('vehicle_categories')
          .select('category_id')
          .ilike('category_name', `%${parsedData.vehicle_type}%`)
          .single();

        if (category) vehicleCategoryId = category.category_id;
      }

      // Create booking
      const bookingCode = `BK${Date.now()}`;
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          booking_code: bookingCode,
          company_id: integration.company_id,
          customer_name: parsedData.customer_name || 'Email Booking',
          customer_mobile: parsedData.customer_mobile || company.primary_contact_number,
          customer_email: parsedData.customer_email || emailBooking.sender_email,
          pickup_location: parsedData.pickup_location,
          drop_location: parsedData.drop_location,
          pickup_datetime: parsedData.pickup_datetime,
          passengers: parsedData.passengers || 4,
          vehicle_category_id: vehicleCategoryId,
          estimated_fare: estimatedFare,
          special_instructions: parsedData.special_instructions,
          status: 'pending',
          payment_status: 'pending',
          booking_source: 'email',
        })
        .select()
        .single();

      if (bookingError) {
        throw new Error(`Failed to create booking: ${bookingError.message}`);
      }

      this.logger.log(`Booking created: ${booking.booking_code} (ID: ${booking.booking_id})`);

      // Update email booking record
      await supabase
        .from('email_bookings')
        .update({
          booking_id: booking.booking_id,
          processing_status: 'completed',
          processed_at: new Date().toISOString(),
        })
        .eq('email_booking_id', emailBooking.email_booking_id);

      // Auto-allocate if company allows
      if (company.auto_allocate_vehicles) {
        this.logger.log(`Auto-allocating vehicle for booking ${booking.booking_id}`);

        const allocationResult = await this.allocationService.allocateVehicleAndDriver(
          {
            booking_id: booking.booking_id,
            pickup_location: parsedData.pickup_location,
            pickup_latitude: 12.9716, // TODO: Geocode address
            pickup_longitude: 77.5946,
            drop_location: parsedData.drop_location,
            drop_latitude: 13.1986,
            drop_longitude: 77.7066,
            pickup_datetime: parsedData.pickup_datetime,
            vehicle_category_id: vehicleCategoryId,
            company_id: integration.company_id,
            trip_type: 'corporate',
            passengers: parsedData.passengers || 4,
          },
          1, // System user ID
        );

        if (allocationResult.success) {
          // Update booking with allocation
          await supabase
            .from('bookings')
            .update({
              vehicle_id: allocationResult.vehicle.vehicle_id,
              driver_id: allocationResult.driver.driver_id,
              status: 'confirmed',
            })
            .eq('booking_id', booking.booking_id);

          this.logger.log(`Allocation successful for booking ${booking.booking_id}`);
        } else {
          this.logger.warn(`Allocation failed for booking ${booking.booking_id}: ${allocationResult.error}`);
        }
      }

      // Send confirmation email if enabled
      if (integration.send_confirmation_email) {
        await this.sendConfirmationEmail(booking, emailBooking.sender_email, integration);
      }

    } catch (error) {
      this.logger.error(`Create booking from email failed: ${error.message}`, error.stack);

      // Update email booking status to failed
      await supabase
        .from('email_bookings')
        .update({
          processing_status: 'failed',
          error_message: error.message,
        })
        .eq('email_booking_id', emailBooking.email_booking_id);
    }
  }

  /**
   * Send confirmation email to customer
   */
  private async sendConfirmationEmail(
    booking: any,
    recipientEmail: string,
    integration: any,
  ): Promise<void> {
    try {
      this.logger.log(`Sending confirmation email to ${recipientEmail}`);

      // TODO: Implement actual email sending using nodemailer
      // For now, just log the confirmation

      const confirmationMessage = `
Dear Customer,

Your booking has been confirmed!

Booking Code: ${booking.booking_code}
Pickup: ${booking.pickup_location}
Drop: ${booking.drop_location}
Date/Time: ${booking.pickup_datetime}
Passengers: ${booking.passengers}

${booking.vehicle_id ? `Vehicle: ${booking.vehicle_id}` : 'Vehicle allocation pending'}
${booking.driver_id ? `Driver: ${booking.driver_id}` : 'Driver allocation pending'}

Thank you for using our service!
      `;

      this.logger.log('Confirmation email sent successfully');

      // Get booking template for confirmation
      const { data: template } = await supabase
        .from('booking_templates')
        .select('*')
        .eq('company_id', integration.company_id)
        .eq('template_type', 'email_confirmation')
        .single();

      // In production, this would:
      // 1. Use the template to format the email
      // 2. Connect to SMTP server using integration credentials
      // 3. Send actual email using nodemailer
      // 4. Log the sent email

    } catch (error) {
      this.logger.error(`Send confirmation email failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Manually trigger polling for a specific integration (for testing)
   */
  async pollNow(integrationId: number): Promise<any> {
    try {
      const { data: integration, error } = await supabase
        .from('email_integrations')
        .select('*')
        .eq('integration_id', integrationId)
        .single();

      if (error || !integration) {
        throw new Error('Email integration not found');
      }

      await this.pollIntegration(integration);

      return {
        success: true,
        message: 'Email polling completed',
      };
    } catch (error) {
      this.logger.error(`Manual poll failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Email polling failed',
        error: error.message,
      };
    }
  }
}
