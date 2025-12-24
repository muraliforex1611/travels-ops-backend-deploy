import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean, IsEnum, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ description: 'Transaction date', example: '2025-12-24' })
  @IsNotEmpty()
  @IsDateString()
  transaction_date: string;

  @ApiProperty({ description: 'Expense category ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  category_id: number;

  @ApiProperty({ description: 'Amount', example: 2000.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Payment mode', enum: ['cash', 'upi', 'card', 'bank_transfer', 'cheque'] })
  @IsNotEmpty()
  @IsEnum(['cash', 'upi', 'card', 'bank_transfer', 'cheque'])
  payment_mode: string;

  @ApiPropertyOptional({ description: 'Related vehicle ID', example: 5 })
  @IsOptional()
  @IsNumber()
  vehicle_id?: number;

  @ApiPropertyOptional({ description: 'Related driver ID', example: 3 })
  @IsOptional()
  @IsNumber()
  driver_id?: number;

  @ApiPropertyOptional({ description: 'Vendor name', example: 'ABC Motors' })
  @IsOptional()
  @IsString()
  vendor_name?: string;

  @ApiPropertyOptional({ description: 'Vendor phone', example: '+91 9876543210' })
  @IsOptional()
  @IsString()
  vendor_phone?: string;

  @ApiPropertyOptional({ description: 'Vendor GST number' })
  @IsOptional()
  @IsString()
  vendor_gst?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Bill number', example: 'BILL001' })
  @IsOptional()
  @IsString()
  bill_number?: string;

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
