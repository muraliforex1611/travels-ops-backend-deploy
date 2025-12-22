// =====================================================================
// Register DTO - User Registration
// =====================================================================

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsOptional,
  Matches,
  Length,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address (must be unique)',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Password (minimum 8 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiProperty({
    example: 'Ramesh Kumar',
    description: 'Full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiPropertyOptional({
    example: '9876543210',
    description: 'Phone number (10-15 digits)',
  })
  @IsString()
  @IsOptional()
  @Length(10, 15)
  @Matches(/^[0-9]+$/, { message: 'Phone number must contain only digits' })
  phone_number?: string;

  @ApiPropertyOptional({
    example: 'customer',
    description: 'User role',
    enum: ['admin', 'driver', 'customer'],
    default: 'customer',
  })
  @IsEnum(['admin', 'driver', 'customer'])
  @IsOptional()
  role?: string;
}
