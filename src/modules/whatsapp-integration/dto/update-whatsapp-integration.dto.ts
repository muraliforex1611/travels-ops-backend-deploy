import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateWhatsappIntegrationDto } from './create-whatsapp-integration.dto';

// Exclude company_id from updates (cannot change company ownership)
export class UpdateWhatsappIntegrationDto extends PartialType(
  OmitType(CreateWhatsappIntegrationDto, ['company_id'] as const),
) {}
