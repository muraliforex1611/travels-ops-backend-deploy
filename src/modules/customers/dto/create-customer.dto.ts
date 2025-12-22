// =====================================================================
// Create Customer DTO
// =====================================================================

import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  Length,
  Matches,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Ramesh Kumar', description: 'Full name of the customer' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ example: '9876543210', description: 'Primary mobile number' })
  @IsString()
  @IsNotEmpty()
  @Length(10, 15)
  @Matches(/^[0-9]+$/, { message: 'Mobile number must contain only digits' })
  mobile_primary: string;

  @ApiPropertyOptional({ example: '9876543211', description: 'Alternate mobile number' })
  @IsString()
  @IsOptional()
  @Length(10, 15)
  @Matches(/^[0-9]+$/, { message: 'Mobile number must contain only digits' })
  mobile_alternate?: string;

  @ApiProperty({ example: 'ramesh@example.com', description: 'Email address' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '123 T Nagar, Chennai', description: 'Address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Chennai', description: 'City' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ example: 'Tamil Nadu', description: 'State' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ example: '600017', description: 'Pincode' })
  @IsString()
  @IsOptional()
  @Length(6, 6)
  pincode?: string;

  @ApiPropertyOptional({ example: 'ABC Corporation', description: 'Company name (for corporate customers)' })
  @IsString()
  @IsOptional()
  company_name?: string;

  @ApiPropertyOptional({ example: 'GSTIN123456789', description: 'GST number (for corporate customers)' })
  @IsString()
  @IsOptional()
  gst_number?: string;

  @ApiPropertyOptional({
    example: 'individual',
    description: 'Customer type',
    enum: ['individual', 'corporate'],
  })
  @IsEnum(['individual', 'corporate'])
  @IsOptional()
  customer_type?: string;

  @ApiPropertyOptional({ example: '1990-05-15', description: 'Date of birth' })
  @IsDateString()
  @IsOptional()
  date_of_birth?: string;

  @ApiPropertyOptional({ example: 'Vegetarian preferred, no smoking', description: 'Preferences' })
  @IsString()
  @IsOptional()
  preferences?: string;

  @ApiPropertyOptional({ example: 'VIP customer', description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
