// =====================================================================
// Cancel Trip DTO
// =====================================================================

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CancelTripDto {
  @ApiProperty({ example: 'Customer requested cancellation', description: 'Cancellation reason' })
  @IsString()
  @IsNotEmpty()
  cancellation_reason: string;

  @ApiPropertyOptional({ example: 50.00, description: 'Cancellation fee' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  cancellation_fee?: number;
}
