import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIncomeDto {
  @ApiProperty({ description: 'Transaction date', example: '2025-12-24' })
  @IsNotEmpty()
  @IsDateString()
  transaction_date: string;

  @ApiProperty({ description: 'Income category ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  category_id: number;

  @ApiProperty({ description: 'Amount', example: 5000.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Payment mode', enum: ['cash', 'upi', 'card', 'bank_transfer', 'cheque'] })
  @IsNotEmpty()
  @IsEnum(['cash', 'upi', 'card', 'bank_transfer', 'cheque'])
  payment_mode: string;

  @ApiPropertyOptional({ description: 'Related booking ID', example: 123 })
  @IsOptional()
  @IsNumber()
  booking_id?: number;

  @ApiPropertyOptional({ description: 'Related company ID', example: 1 })
  @IsOptional()
  @IsNumber()
  company_id?: number;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Receipt number', example: 'RCP001' })
  @IsOptional()
  @IsString()
  receipt_number?: string;

  @ApiPropertyOptional({ description: 'Invoice number', example: 'INV001' })
  @IsOptional()
  @IsString()
  invoice_number?: string;

  @ApiPropertyOptional({ description: 'Is GST applicable', example: true })
  @IsOptional()
  @IsBoolean()
  is_gst_applicable?: boolean;

  @ApiPropertyOptional({ description: 'GST percentage', example: 18 })
  @IsOptional()
  @IsNumber()
  gst_percentage?: number;

  @ApiPropertyOptional({ description: 'Remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateIncomeDto {
  @ApiPropertyOptional({ description: 'Transaction date', example: '2025-12-24' })
  @IsOptional()
  @IsDateString()
  transaction_date?: string;

  @ApiPropertyOptional({ description: 'Amount', example: 5000.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: 'Payment mode', enum: ['cash', 'upi', 'card', 'bank_transfer', 'cheque'] })
  @IsOptional()
  @IsEnum(['cash', 'upi', 'card', 'bank_transfer', 'cheque'])
  payment_mode?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
