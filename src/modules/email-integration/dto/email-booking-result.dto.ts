import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ParsedBookingDataDto {
  @ApiPropertyOptional({ description: 'Customer name', example: 'John Doe' })
  customer_name?: string;

  @ApiPropertyOptional({ description: 'Customer email', example: 'john@example.com' })
  customer_email?: string;

  @ApiPropertyOptional({ description: 'Customer mobile', example: '+91 9876543210' })
  customer_mobile?: string;

  @ApiPropertyOptional({ description: 'Pickup location', example: 'Electronic City' })
  pickup_location?: string;

  @ApiPropertyOptional({ description: 'Drop location', example: 'Airport' })
  drop_location?: string;

  @ApiPropertyOptional({ description: 'Pickup datetime', example: '2025-12-25T10:00:00Z' })
  pickup_datetime?: string;

  @ApiPropertyOptional({ description: 'Number of passengers', example: 4 })
  passengers?: number;

  @ApiPropertyOptional({ description: 'Vehicle type requested', example: 'SUV' })
  vehicle_type?: string;

  @ApiPropertyOptional({ description: 'Special instructions', example: 'Please call 10 mins before arrival' })
  special_instructions?: string;
}

export class EmailBookingResultDto {
  @ApiProperty({ description: 'Processing success status', example: true })
  success: boolean;

  @ApiProperty({ description: 'Result message', example: 'Booking created successfully' })
  message: string;

  @ApiPropertyOptional({ description: 'Email booking record ID', example: 123 })
  email_booking_id?: number;

  @ApiPropertyOptional({ description: 'Created booking ID', example: 456 })
  booking_id?: number;

  @ApiPropertyOptional({ description: 'Parsed booking data from email' })
  parsed_data?: ParsedBookingDataDto;

  @ApiPropertyOptional({ description: 'Parsing confidence score (0-100)', example: 85 })
  parsing_confidence?: number;

  @ApiPropertyOptional({ description: 'Error message if processing failed' })
  error?: string;

  @ApiPropertyOptional({ description: 'Email subject', example: 'Cab Booking Request for 25th Dec' })
  email_subject?: string;

  @ApiPropertyOptional({ description: 'Sender email', example: 'hr@infosys.com' })
  sender_email?: string;
}
