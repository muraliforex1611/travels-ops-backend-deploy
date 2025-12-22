// =====================================================================
// Update Booking DTO
// =====================================================================

import { IsString, IsNumber, IsOptional, IsDateString, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookingDto {
  @ApiProperty({ example: 'John Doe', description: 'Customer name', required: false })
  @IsString()
  @IsOptional()
  customer_name?: string;

  @ApiProperty({ example: '9876543210', description: 'Customer mobile', required: false })
  @IsString()
  @IsOptional()
  customer_mobile?: string;

  @ApiProperty({ example: 'john@example.com', description: 'Customer email', required: false })
  @IsString()
  @IsOptional()
  customer_email?: string;

  @ApiProperty({ example: '123 Main St, Chennai', description: 'Pickup location', required: false })
  @IsString()
  @IsOptional()
  pickup_location?: string;

  @ApiProperty({ example: 13.0827, description: 'Pickup latitude', required: false })
  @IsNumber()
  @IsOptional()
  pickup_lat?: number;

  @ApiProperty({ example: 80.2707, description: 'Pickup longitude', required: false })
  @IsNumber()
  @IsOptional()
  pickup_lng?: number;

  @ApiProperty({ example: '456 Park Ave, Chennai', description: 'Drop location', required: false })
  @IsString()
  @IsOptional()
  drop_location?: string;

  @ApiProperty({ example: 13.0878, description: 'Drop latitude', required: false })
  @IsNumber()
  @IsOptional()
  drop_lat?: number;

  @ApiProperty({ example: 80.2785, description: 'Drop longitude', required: false })
  @IsNumber()
  @IsOptional()
  drop_lng?: number;

  @ApiProperty({ example: '2025-12-25T10:00:00Z', description: 'Pickup date and time', required: false })
  @IsDateString()
  @IsOptional()
  pickup_datetime?: string;

  @ApiProperty({ example: 1, description: 'Vehicle category ID', required: false })
  @IsNumber()
  @IsOptional()
  vehicle_category_id?: number;

  @ApiProperty({ example: 4, description: 'Number of passengers', required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  passengers?: number;

  @ApiProperty({ example: 25.5, description: 'Distance in km', required: false })
  @IsNumber()
  @IsOptional()
  distance_km?: number;

  @ApiProperty({ example: 500.00, description: 'Estimated fare', required: false })
  @IsNumber()
  @IsOptional()
  estimated_fare?: number;

  @ApiProperty({ example: 550.00, description: 'Actual fare', required: false })
  @IsNumber()
  @IsOptional()
  actual_fare?: number;

  @ApiProperty({ example: 1, description: 'Assigned driver ID', required: false })
  @IsNumber()
  @IsOptional()
  driver_id?: number;

  @ApiProperty({ example: 1, description: 'Assigned vehicle ID', required: false })
  @IsNumber()
  @IsOptional()
  vehicle_id?: number;

  @ApiProperty({
    example: 'confirmed',
    description: 'Booking status',
    required: false,
    enum: ['pending', 'confirmed', 'driver_assigned', 'in_progress', 'completed', 'cancelled']
  })
  @IsEnum(['pending', 'confirmed', 'driver_assigned', 'in_progress', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;

  @ApiProperty({
    example: 'paid',
    description: 'Payment status',
    required: false,
    enum: ['pending', 'paid', 'failed', 'refunded']
  })
  @IsEnum(['pending', 'paid', 'failed', 'refunded'])
  @IsOptional()
  payment_status?: string;

  @ApiProperty({ example: 'Need AC', description: 'Special requirements', required: false })
  @IsString()
  @IsOptional()
  special_requirements?: string;
}
