import { Module } from '@nestjs/common';
import { WhatsappIntegrationController } from './whatsapp-integration.controller';
import { WhatsappIntegrationService } from './whatsapp-integration.service';
import { WhatsappWebhookService } from './whatsapp-webhook.service';
import { AllocationModule } from '../allocation/allocation.module';

@Module({
  imports: [
    AllocationModule, // For auto-allocation after booking creation
  ],
  controllers: [WhatsappIntegrationController],
  providers: [WhatsappIntegrationService, WhatsappWebhookService],
  exports: [WhatsappIntegrationService, WhatsappWebhookService],
})
export class WhatsappIntegrationModule {}
