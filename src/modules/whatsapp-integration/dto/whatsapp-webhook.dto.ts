import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WhatsappWebhookDto {
  @ApiProperty({ description: 'Webhook object type', example: 'whatsapp_business_account' })
  object: string;

  @ApiProperty({ description: 'Webhook entry data' })
  entry: any[];
}

export class WhatsappMessageDto {
  @ApiProperty({ description: 'Message ID', example: 'wamid.HBgNOTE...' })
  id: string;

  @ApiProperty({ description: 'Sender phone number', example: '919876543210' })
  from: string;

  @ApiProperty({ description: 'Message timestamp', example: '1703419200' })
  timestamp: string;

  @ApiProperty({ description: 'Message type', example: 'text' })
  type: string;

  @ApiPropertyOptional({ description: 'Text message content' })
  text?: {
    body: string;
  };

  @ApiPropertyOptional({ description: 'Interactive message content' })
  interactive?: {
    type: string;
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
    };
  };
}

export class ParsedWhatsappDataDto {
  @ApiPropertyOptional({ description: 'Customer name', example: 'John Doe' })
  customer_name?: string;

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

  @ApiPropertyOptional({ description: 'Vehicle type', example: 'SUV' })
  vehicle_type?: string;

  @ApiPropertyOptional({ description: 'Special instructions' })
  special_instructions?: string;
}
