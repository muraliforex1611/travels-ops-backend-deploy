// =====================================================================
// Start Trip DTO
// =====================================================================

import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StartTripDto {
  @ApiProperty({ example: 1, description: 'Booking ID to start trip from' })
  @IsNumber()
  @IsNotEmpty()
  booking_id: number;

  @ApiPropertyOptional({ example: 45234.56, description: 'Starting odometer reading' })
  @IsNumber()
  @IsOptional()
  start_odometer?: number;

  @ApiPropertyOptional({ example: 13.0827, description: 'Starting latitude' })
  @IsNumber()
  @IsOptional()
  start_lat?: number;

  @ApiPropertyOptional({ example: 80.2707, description: 'Starting longitude' })
  @IsNumber()
  @IsOptional()
  start_lng?: number;

  @ApiPropertyOptional({ example: 'Starting from customer location', description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
