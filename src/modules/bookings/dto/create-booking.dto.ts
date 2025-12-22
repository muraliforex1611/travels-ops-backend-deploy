// =====================================================================
// Create Booking DTO
// =====================================================================

import { IsString, IsNotEmpty, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'John Doe', description: 'Customer name' })
  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @ApiProperty({ example: '9876543210', description: 'Customer mobile' })
  @IsString()
  @IsNotEmpty()
  customer_mobile: string;

  @ApiProperty({ example: 'john@example.com', description: 'Customer email', required: false })
  @IsString()
  @IsOptional()
  customer_email?: string;

  @ApiProperty({ example: '123 Main St, Chennai', description: 'Pickup location' })
  @IsString()
  @IsNotEmpty()
  pickup_location: string;

  @ApiProperty({ example: 13.0827, description: 'Pickup latitude', required: false })
  @IsNumber()
  @IsOptional()
  pickup_lat?: number;

  @ApiProperty({ example: 80.2707, description: 'Pickup longitude', required: false })
  @IsNumber()
  @IsOptional()
  pickup_lng?: number;

  @ApiProperty({ example: '456 Park Ave, Chennai', description: 'Drop location' })
  @IsString()
  @IsNotEmpty()
  drop_location: string;

  @ApiProperty({ example: 13.0878, description: 'Drop latitude', required: false })
  @IsNumber()
  @IsOptional()
  drop_lat?: number;

  @ApiProperty({ example: 80.2785, description: 'Drop longitude', required: false })
  @IsNumber()
  @IsOptional()
  drop_lng?: number;

  @ApiProperty({ example: '2025-12-25T10:00:00Z', description: 'Pickup date and time' })
  @IsDateString()
  pickup_datetime: string;

  @ApiProperty({ example: 1, description: 'Vehicle category ID' })
  @IsNumber()
  vehicle_category_id: number;

  @ApiProperty({ example: 4, description: 'Number of passengers' })
  @IsNumber()
  @Min(1)
  passengers: number;

  @ApiProperty({ example: 25.5, description: 'Distance in km', required: false })
  @IsNumber()
  @IsOptional()
  distance_km?: number;

  @ApiProperty({ example: 'Need AC, Luggage space', description: 'Special requirements', required: false })
  @IsString()
  @IsOptional()
  special_requirements?: string;
}
