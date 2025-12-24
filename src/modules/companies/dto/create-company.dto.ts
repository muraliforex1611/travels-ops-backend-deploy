// =====================================================================
// Create Company DTO
// =====================================================================

import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({
    example: 'Infosys Technologies Ltd',
    description: 'Company name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  company_name: string;

  @ApiProperty({
    example: 'INFY001',
    description: 'Unique company code',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Company code must contain only uppercase letters and numbers',
  })
  company_code: string;

  @ApiProperty({
    example: '@infosys.com',
    description: 'Email domain for auto-validation (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^@[a-z0-9.-]+\.[a-z]{2,}$/i, {
    message: 'Email domain must start with @ and be a valid domain',
  })
  email_domain?: string;

  @ApiProperty({
    example: 'Electronics City, Phase 1, Bangalore, Karnataka - 560100',
    description: 'Billing address',
    required: false,
  })
  @IsString()
  @IsOptional()
  billing_address?: string;

  @ApiProperty({
    example: '29AABCI1234F1Z5',
    description: 'GST number (15 characters)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'Invalid GST number format',
  })
  gst_number?: string;

  @ApiProperty({
    example: 'AABCI1234F',
    description: 'PAN number (10 characters)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: 'Invalid PAN number format',
  })
  pan_number?: string;

  @ApiProperty({
    example: 'Ramesh Kumar',
    description: 'Contact person name',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  contact_person?: string;

  @ApiProperty({
    example: 'transport.admin@infosys.com',
    description: 'Contact email',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  contact_email?: string;

  @ApiProperty({
    example: '+91 80 2852 0261',
    description: 'Contact phone number',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[+]?[\d\s-()]+$/, {
    message: 'Invalid phone number format',
  })
  contact_phone?: string;

  @ApiProperty({
    example: 500000.0,
    description: 'Credit limit amount',
    required: false,
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  credit_limit?: number;

  @ApiProperty({
    example: '30 days',
    description: 'Payment terms',
    required: false,
    default: 'prepaid',
    enum: ['prepaid', '15 days', '30 days', '45 days', '60 days'],
  })
  @IsString()
  @IsOptional()
  @IsEnum(['prepaid', '15 days', '30 days', '45 days', '60 days'])
  payment_terms?: string;

  @ApiProperty({
    example: true,
    description: 'Auto-approve bookings from this company',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  auto_approve_bookings?: boolean;

  @ApiProperty({
    example: true,
    description: 'Auto-allocate vehicles for bookings',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  auto_allocate_vehicles?: boolean;

  @ApiProperty({
    example: 1,
    description: 'Preferred vehicle category ID',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  preferred_vehicle_category_id?: number;

  @ApiProperty({
    example: true,
    description: 'Is company active',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
