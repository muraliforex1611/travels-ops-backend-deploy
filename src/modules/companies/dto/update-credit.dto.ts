// =====================================================================
// Update Credit DTO
// =====================================================================

import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCreditDto {
  @ApiProperty({
    example: 500000.0,
    description: 'New credit limit',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  credit_limit?: number;

  @ApiProperty({
    example: 50000.0,
    description: 'Amount to add to outstanding (positive) or reduce (negative)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  outstanding_adjustment?: number;

  @ApiProperty({
    example: 'Payment received for invoice #INV-001',
    description: 'Reason for adjustment',
    required: false,
  })
  @IsString()
  @IsOptional()
  adjustment_reason?: string;
}
