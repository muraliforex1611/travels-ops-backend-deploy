import { Injectable, Logger } from '@nestjs/common';
import { supabase } from '../../config/database.config';
import { WhatsappIntegrationService } from './whatsapp-integration.service';
import { AllocationService } from '../allocation/allocation.service';
import axios from 'axios';

@Injectable()
export class WhatsappWebhookService {
  private readonly logger = new Logger(WhatsappWebhookService.name);
  private readonly whatsappApiUrl = 'https://graph.facebook.com';

  constructor(
    private readonly whatsappIntegrationService: WhatsappIntegrationService,
    private readonly allocationService: AllocationService,
  ) {}

  /**
   * Handle incoming WhatsApp webhook
   */
  async handleWebhook(webhookData: any): Promise<void> {
    try {
      this.logger.log('Received WhatsApp webhook');

      if (!webhookData.entry || webhookData.entry.length === 0) {
        this.logger.warn('No entries in webhook data');
        return;
      }

      // Process each entry
      for (const entry of webhookData.entry) {
        if (!entry.changes) continue;

        for (const change of entry.changes) {
          if (change.field === 'messages' && change.value?.messages) {
            // Process each message
            for (const message of change.value.messages) {
              await this.processMessage(message, change.value.metadata);
            }
          }
        }
      }
    } catch (error) {
      this.logger.error(`Webhook handling failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Process a single WhatsApp message
   */
  private async processMessage(message: any, metadata: any): Promise<void> {
    try {
      this.logger.log(`Processing WhatsApp message ${message.id} from ${message.from}`);

      // Find integration by phone number ID
      const integration = await this.whatsappIntegrationService.findByPhoneNumberId(
        metadata.phone_number_id,
      );

      if (!integration) {
        this.logger.warn(`No integration found for phone number ID ${metadata.phone_number_id}`);
        return;
      }

      // Check if message already processed
      const { data: existing } = await supabase
        .from('whatsapp_bookings')
        .select('whatsapp_booking_id')
        .eq('integration_id', integration.integration_id)
        .eq('message_id', message.id)
        .single();

      if (existing) {
        this.logger.log(`Message ${message.id} already processed, skipping`);
        return;
      }

      // Extract message text
      let messageText = '';
      let messageType = message.type;

      if (message.type === 'text') {
        messageText = message.text.body;
      } else if (message.type === 'interactive') {
        // Handle button/list replies
        if (message.interactive.button_reply) {
          messageText = message.interactive.button_reply.title;
        } else if (message.interactive.list_reply) {
          messageText = message.interactive.list_reply.title;
        }
      }

      // Send greeting/menu if message is a greeting
      if (this.isGreeting(messageText)) {
        await this.sendInteractiveMenu(message.from, integration);
        return;
      }

      // Parse message content
      const parsedData = this.whatsappIntegrationService.parseMessageContent(messageText);
      const confidence = this.whatsappIntegrationService.calculateConfidence(parsedData);

      this.logger.log(`Parsed message with ${confidence}% confidence`);

      // Log WhatsApp booking
      const { data: whatsappBooking, error: logError } = await supabase
        .from('whatsapp_bookings')
        .insert({
          integration_id: integration.integration_id,
          message_id: message.id,
          sender_phone: message.from,
          message_text: messageText,
          message_type: messageType,
          parsed_data: parsedData,
          parsing_confidence: confidence,
          processing_status: confidence >= 70 ? 'pending' : 'failed',
          received_at: new Date(parseInt(message.timestamp) * 1000),
        })
        .select()
        .single();

      if (logError) {
        this.logger.error(`Failed to log WhatsApp booking: ${logError.message}`);
        return;
      }

      // Auto-create booking if enabled and confidence is high enough
      if (integration.auto_create_booking && confidence >= 70) {
        await this.createBookingFromWhatsapp(whatsappBooking, parsedData, integration, message.from);
      } else if (confidence < 70) {
        // Send message asking for more details
        await this.sendMessage(
          message.from,
          'I need more details to create your booking. Please provide:\n\n' +
          '- Pickup location\n' +
          '- Drop location\n' +
          '- Date and time\n' +
          '- Number of passengers',
          integration,
        );
      }

    } catch (error) {
      this.logger.error(`Process message failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Create booking from WhatsApp message
   */
  private async createBookingFromWhatsapp(
    whatsappBooking: any,
    parsedData: any,
    integration: any,
    senderPhone: string,
  ): Promise<void> {
    try {
      this.logger.log(`Creating booking from WhatsApp message ${whatsappBooking.whatsapp_booking_id}`);

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
        await this.sendMessage(
          senderPhone,
          'Sorry, your credit limit has been exceeded. Please contact support.',
          integration,
        );
        throw new Error('Insufficient credit limit');
      }

      // Get vehicle category
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
      const bookingCode = `WA${Date.now()}`;
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          booking_code: bookingCode,
          company_id: integration.company_id,
          customer_name: parsedData.customer_name || 'WhatsApp Booking',
          customer_mobile: parsedData.customer_mobile || `+${senderPhone}`,
          pickup_location: parsedData.pickup_location,
          drop_location: parsedData.drop_location,
          pickup_datetime: parsedData.pickup_datetime,
          passengers: parsedData.passengers || 4,
          vehicle_category_id: vehicleCategoryId,
          estimated_fare: estimatedFare,
          special_instructions: parsedData.special_instructions,
          status: 'pending',
          payment_status: 'pending',
          booking_source: 'whatsapp',
        })
        .select()
        .single();

      if (bookingError) {
        throw new Error(`Failed to create booking: ${bookingError.message}`);
      }

      this.logger.log(`Booking created: ${booking.booking_code} (ID: ${booking.booking_id})`);

      // Update WhatsApp booking record
      await supabase
        .from('whatsapp_bookings')
        .update({
          booking_id: booking.booking_id,
          processing_status: 'completed',
          processed_at: new Date().toISOString(),
        })
        .eq('whatsapp_booking_id', whatsappBooking.whatsapp_booking_id);

      // Auto-allocate if company allows
      let allocationResult = null;
      if (company.auto_allocate_vehicles) {
        this.logger.log(`Auto-allocating vehicle for booking ${booking.booking_id}`);

        allocationResult = await this.allocationService.allocateVehicleAndDriver(
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
        }
      }

      // Send confirmation message
      if (integration.send_confirmation_message) {
        await this.sendConfirmationMessage(booking, allocationResult, senderPhone, integration);
      }

    } catch (error) {
      this.logger.error(`Create booking from WhatsApp failed: ${error.message}`, error.stack);

      // Update WhatsApp booking status to failed
      await supabase
        .from('whatsapp_bookings')
        .update({
          processing_status: 'failed',
          error_message: error.message,
        })
        .eq('whatsapp_booking_id', whatsappBooking.whatsapp_booking_id);

      // Send error message to customer
      await this.sendMessage(
        senderPhone,
        'Sorry, we could not create your booking. Please try again or contact support.',
        integration,
      );
    }
  }

  /**
   * Send simple text message via WhatsApp API
   */
  async sendMessage(
    to: string,
    message: string,
    integration: any,
  ): Promise<void> {
    try {
      const accessToken = this.whatsappIntegrationService.getDecryptedToken(integration);
      const url = `${this.whatsappApiUrl}/${integration.api_version}/${integration.phone_number_id}/messages`;

      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Message sent to ${to}`);
    } catch (error) {
      this.logger.error(`Send message failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Send interactive menu with buttons
   */
  private async sendInteractiveMenu(
    to: string,
    integration: any,
  ): Promise<void> {
    try {
      if (!integration.enable_interactive_menu) {
        await this.sendMessage(to, 'Welcome! Please send your booking details.', integration);
        return;
      }

      const accessToken = this.whatsappIntegrationService.getDecryptedToken(integration);
      const url = `${this.whatsappApiUrl}/${integration.api_version}/${integration.phone_number_id}/messages`;

      await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: {
              text: 'Welcome! How can I help you today?',
            },
            action: {
              buttons: [
                {
                  type: 'reply',
                  reply: {
                    id: 'new_booking',
                    title: 'New Booking',
                  },
                },
                {
                  type: 'reply',
                  reply: {
                    id: 'track_booking',
                    title: 'Track Booking',
                  },
                },
                {
                  type: 'reply',
                  reply: {
                    id: 'cancel_booking',
                    title: 'Cancel Booking',
                  },
                },
              ],
            },
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Interactive menu sent to ${to}`);
    } catch (error) {
      this.logger.error(`Send interactive menu failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Send booking confirmation message
   */
  private async sendConfirmationMessage(
    booking: any,
    allocationResult: any,
    to: string,
    integration: any,
  ): Promise<void> {
    try {
      let message = `✅ *Booking Confirmed!*\n\n`;
      message += `Booking Code: *${booking.booking_code}*\n`;
      message += `Pickup: ${booking.pickup_location}\n`;
      message += `Drop: ${booking.drop_location}\n`;
      message += `Date/Time: ${booking.pickup_datetime}\n`;
      message += `Passengers: ${booking.passengers}\n\n`;

      if (allocationResult?.success) {
        message += `🚗 *Vehicle Details*\n`;
        message += `Vehicle: ${allocationResult.vehicle.make} ${allocationResult.vehicle.model}\n`;
        message += `Registration: ${allocationResult.vehicle.registration_number}\n\n`;
        message += `👨‍✈️ *Driver Details*\n`;
        message += `Name: ${allocationResult.driver.full_name}\n`;
        message += `Mobile: ${allocationResult.driver.mobile_number}\n`;
        message += `Rating: ⭐ ${allocationResult.driver.rating}/5\n\n`;
      } else {
        message += `⏳ Vehicle allocation pending...\n\n`;
      }

      message += `Thank you for choosing our service! 🙏`;

      await this.sendMessage(to, message, integration);
    } catch (error) {
      this.logger.error(`Send confirmation message failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Check if message is a greeting
   */
  private isGreeting(text: string): boolean {
    const greetings = ['hi', 'hello', 'hey', 'hola', 'namaste', 'vanakkam', 'start'];
    const textLower = text.toLowerCase().trim();
    return greetings.includes(textLower);
  }
}
