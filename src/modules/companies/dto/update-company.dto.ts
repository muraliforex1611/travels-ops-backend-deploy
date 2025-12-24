// =====================================================================
// Update Company DTO
// =====================================================================

import { PartialType } from '@nestjs/swagger';
import { CreateCompanyDto } from './create-company.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  // All fields from CreateCompanyDto are now optional
}
