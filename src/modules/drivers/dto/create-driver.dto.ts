// =====================================================================
// Create Driver DTO
// =====================================================================

import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsDateString,
  IsEnum,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDriverDto {
  @ApiProperty({ example: 'Rajesh Kumar', description: 'Full name of the driver' })
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

  @ApiPropertyOptional({ example: 'rajesh@example.com', description: 'Email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '123 Anna Nagar, Chennai', description: 'Address' })
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

  @ApiPropertyOptional({ example: '600001', description: 'Pincode' })
  @IsString()
  @IsOptional()
  @Length(6, 6)
  pincode?: string;

  @ApiProperty({ example: 'TN09AB123456', description: 'Driving license number' })
  @IsString()
  @IsNotEmpty()
  license_number: string;

  @ApiPropertyOptional({ example: '2015-06-15', description: 'License issue date' })
  @IsDateString()
  @IsOptional()
  license_issue_date?: string;

  @ApiProperty({ example: '2030-06-14', description: 'License expiry date' })
  @IsDateString()
  @IsNotEmpty()
  license_expiry_date: string;

  @ApiProperty({ example: 'BADGE001', description: 'Badge number' })
  @IsString()
  @IsNotEmpty()
  badge_number: string;

  @ApiProperty({ example: '2026-12-31', description: 'Badge expiry date' })
  @IsDateString()
  @IsNotEmpty()
  badge_expiry_date: string;

  @ApiPropertyOptional({ example: 'ABCDE1234F', description: 'PAN number' })
  @IsString()
  @IsOptional()
  pan_number?: string;

  @ApiPropertyOptional({ example: '123456789012', description: 'Aadhaar number' })
  @IsString()
  @IsOptional()
  @Length(12, 12)
  aadhaar_number?: string;

  @ApiPropertyOptional({
    example: 'company_employed',
    description: 'Driver type',
    enum: ['company_employed', 'attached_vehicle', 'contract'],
  })
  @IsEnum(['company_employed', 'attached_vehicle', 'contract'])
  @IsOptional()
  driver_type?: string;

  @ApiPropertyOptional({ example: '2020-01-15', description: 'Employment start date' })
  @IsDateString()
  @IsOptional()
  employment_start_date?: string;

  @ApiPropertyOptional({ example: 'Any special notes', description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
