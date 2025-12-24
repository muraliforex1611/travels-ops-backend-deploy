import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AllocationScoreDto {
  @ApiProperty({ description: 'Availability score (0-100)', example: 95 })
  availability_score: number;

  @ApiProperty({ description: 'Distance score (0-100)', example: 85 })
  distance_score: number;

  @ApiProperty({ description: 'Rating score (0-100)', example: 90 })
  rating_score: number;

  @ApiProperty({ description: 'Cost score (0-100)', example: 75 })
  cost_score: number;

  @ApiProperty({ description: 'Fuel score (0-100)', example: 80 })
  fuel_score: number;

  @ApiProperty({ description: 'Total weighted score', example: 86.5 })
  total_score: number;
}

export class AllocatedVehicleDto {
  @ApiProperty({ description: 'Vehicle ID', example: 1 })
  vehicle_id: number;

  @ApiProperty({ description: 'Vehicle registration number', example: 'KA01AB1234' })
  registration_number: string;

  @ApiProperty({ description: 'Vehicle make', example: 'Toyota' })
  make: string;

  @ApiProperty({ description: 'Vehicle model', example: 'Innova Crysta' })
  model: string;

  @ApiProperty({ description: 'Vehicle category', example: 'SUV' })
  category_name: string;

  @ApiProperty({ description: 'Current location', example: 'Koramangala, Bangalore' })
  current_location: string;

  @ApiProperty({ description: 'Distance from pickup (km)', example: 5.2 })
  distance_from_pickup: number;

  @ApiProperty({ description: 'Fuel level percentage', example: 85 })
  fuel_level: number;

  @ApiProperty({ description: 'Estimated cost', example: 1500.00 })
  estimated_cost: number;
}

export class AllocatedDriverDto {
  @ApiProperty({ description: 'Driver ID', example: 1 })
  driver_id: number;

  @ApiProperty({ description: 'Driver name', example: 'Rajesh Kumar' })
  full_name: string;

  @ApiProperty({ description: 'Driver mobile', example: '+91 9876543210' })
  mobile_number: string;

  @ApiProperty({ description: 'Average rating', example: 4.8 })
  rating: number;

  @ApiProperty({ description: 'Total completed trips', example: 450 })
  total_trips: number;

  @ApiProperty({ description: 'License number', example: 'KA0120180012345' })
  license_number: string;
}

export class AllocationResultDto {
  @ApiProperty({ description: 'Allocation successful', example: true })
  success: boolean;

  @ApiProperty({ description: 'Allocation message', example: 'Vehicle and driver allocated successfully' })
  message: string;

  @ApiPropertyOptional({ description: 'Allocated vehicle details' })
  vehicle?: AllocatedVehicleDto;

  @ApiPropertyOptional({ description: 'Allocated driver details' })
  driver?: AllocatedDriverDto;

  @ApiPropertyOptional({ description: 'Allocation scoring breakdown' })
  score?: AllocationScoreDto;

  @ApiPropertyOptional({ description: 'Allocation log ID', example: 123 })
  allocation_log_id?: number;

  @ApiPropertyOptional({ description: 'Allocation rule used', example: 'Premium Service Rule' })
  rule_used?: string;

  @ApiPropertyOptional({ description: 'Error message if allocation failed', example: 'No available vehicles found' })
  error?: string;
}
