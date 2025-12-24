import { IsNotEmpty, IsString, IsInt, IsOptional, IsBoolean, IsEnum, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWhatsappIntegrationDto {
  @ApiProperty({
    description: 'Company ID that owns this WhatsApp integration',
    example: 1,
  })
  @IsNotEmpty()
  @IsInt()
  company_id: number;

  @ApiProperty({
    description: 'Display name for this WhatsApp integration',
    example: 'Infosys Booking WhatsApp',
  })
  @IsNotEmpty()
  @IsString()
  integration_name: string;

  @ApiProperty({
    description: 'WhatsApp Business phone number (with country code)',
    example: '+919876543210',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be in E.164 format (e.g., +919876543210)',
  })
  phone_number: string;

  @ApiProperty({
    description: 'WhatsApp Business Account ID from Meta',
    example: '123456789012345',
  })
  @IsNotEmpty()
  @IsString()
  business_account_id: string;

  @ApiProperty({
    description: 'WhatsApp Phone Number ID from Meta',
    example: '987654321098765',
  })
  @IsNotEmpty()
  @IsString()
  phone_number_id: string;

  @ApiProperty({
    description: 'WhatsApp API Access Token from Meta',
    example: 'EAABsbCS1iHgBAOZCZC...',
  })
  @IsNotEmpty()
  @IsString()
  access_token: string;

  @ApiProperty({
    description: 'Webhook verify token (for security)',
    example: 'my_secure_verify_token_123',
  })
  @IsNotEmpty()
  @IsString()
  webhook_verify_token: string;

  @ApiPropertyOptional({
    description: 'API version to use',
    example: 'v18.0',
    default: 'v18.0',
  })
  @IsOptional()
  @IsString()
  api_version?: string;

  @ApiPropertyOptional({
    description: 'Auto-create bookings from WhatsApp messages',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  auto_create_booking?: boolean;

  @ApiPropertyOptional({
    description: 'Send confirmation messages after booking creation',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  send_confirmation_message?: boolean;

  @ApiPropertyOptional({
    description: 'Enable interactive buttons/menus',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  enable_interactive_menu?: boolean;
}
