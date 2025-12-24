import { IsNotEmpty, IsString, IsEmail, IsInt, IsOptional, IsBoolean, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmailIntegrationDto {
  @ApiProperty({
    description: 'Company ID that owns this email integration',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  company_id: number;

  @ApiProperty({
    description: 'Display name for this email integration',
    example: 'Infosys HR Booking Email',
  })
  @IsNotEmpty()
  @IsString()
  integration_name: string;

  @ApiProperty({
    description: 'Email address to monitor for booking requests',
    example: 'bookings@infosys.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email_address: string;

  @ApiProperty({
    description: 'Email account password (will be encrypted)',
    example: 'SecurePassword123',
  })
  @IsNotEmpty()
  @IsString()
  email_password: string;

  @ApiProperty({
    description: 'IMAP server hostname',
    example: 'imap.gmail.com',
  })
  @IsNotEmpty()
  @IsString()
  imap_host: string;

  @ApiPropertyOptional({
    description: 'IMAP server port',
    example: 993,
    default: 993,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  imap_port?: number;

  @ApiPropertyOptional({
    description: 'Use TLS for IMAP connection',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  imap_tls?: boolean;

  @ApiPropertyOptional({
    description: 'SMTP server hostname for sending confirmations',
    example: 'smtp.gmail.com',
  })
  @IsOptional()
  @IsString()
  smtp_host?: string;

  @ApiPropertyOptional({
    description: 'SMTP server port',
    example: 587,
    default: 587,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  smtp_port?: number;

  @ApiPropertyOptional({
    description: 'Use TLS for SMTP connection',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  smtp_tls?: boolean;

  @ApiPropertyOptional({
    description: 'Email polling interval in minutes',
    example: 5,
    default: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  polling_interval_minutes?: number;

  @ApiPropertyOptional({
    description: 'Auto-create bookings from parsed emails',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  auto_create_booking?: boolean;

  @ApiPropertyOptional({
    description: 'Send confirmation emails after booking creation',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  send_confirmation_email?: boolean;
}
