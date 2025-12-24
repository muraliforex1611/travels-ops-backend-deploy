import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDateString, IsEnum, Min, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AllocationRequestDto {
  @ApiProperty({
    description: 'Booking ID for which allocation is requested',
    example: 123,
  })
  @IsNotEmpty()
  @IsInt()
  booking_id: number;

  @ApiProperty({
    description: 'Pickup location name',
    example: 'Electronic City, Bangalore',
  })
  @IsNotEmpty()
  @IsString()
  pickup_location: string;

  @ApiProperty({
    description: 'Pickup latitude',
    example: 12.8456,
  })
  @IsNotEmpty()
  @IsNumber()
  pickup_latitude: number;

  @ApiProperty({
    description: 'Pickup longitude',
    example: 77.6603,
  })
  @IsNotEmpty()
  @IsNumber()
  pickup_longitude: number;

  @ApiProperty({
    description: 'Drop location name',
    example: 'Kempegowda International Airport',
  })
  @IsNotEmpty()
  @IsString()
  drop_location: string;

  @ApiProperty({
    description: 'Drop latitude',
    example: 13.1986,
  })
  @IsNotEmpty()
  @IsNumber()
  drop_latitude: number;

  @ApiProperty({
    description: 'Drop longitude',
    example: 77.7066,
  })
  @IsNotEmpty()
  @IsNumber()
  drop_longitude: number;

  @ApiProperty({
    description: 'Scheduled pickup datetime',
    example: '2025-12-25T10:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  pickup_datetime: string;

  @ApiProperty({
    description: 'Required vehicle category ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  vehicle_category_id: number;

  @ApiPropertyOptional({
    description: 'Company ID (for corporate bookings)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  company_id?: number;

  @ApiPropertyOptional({
    description: 'Trip type: regular, emergency, corporate, shuttle',
    example: 'regular',
    enum: ['regular', 'emergency', 'corporate', 'shuttle'],
  })
  @IsOptional()
  @IsEnum(['regular', 'emergency', 'corporate', 'shuttle'])
  trip_type?: string;

  @ApiPropertyOptional({
    description: 'Allocation rule ID to use (if specific rule required)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  allocation_rule_id?: number;

  @ApiPropertyOptional({
    description: 'Number of passengers',
    example: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  passengers?: number;
}
