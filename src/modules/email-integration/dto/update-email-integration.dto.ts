import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateEmailIntegrationDto } from './create-email-integration.dto';

// Exclude company_id from updates (cannot change company ownership)
export class UpdateEmailIntegrationDto extends PartialType(
  OmitType(CreateEmailIntegrationDto, ['company_id'] as const),
) {}
