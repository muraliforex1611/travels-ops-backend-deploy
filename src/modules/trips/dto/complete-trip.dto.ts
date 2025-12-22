// =====================================================================
// Complete Trip DTO
// =====================================================================

import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteTripDto {
  @ApiProperty({ example: 45260.50, description: 'Ending odometer reading' })
  @IsNumber()
  @IsNotEmpty()
  end_odometer: number;

  @ApiProperty({ example: 25.5, description: 'Total distance traveled in km' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  distance_traveled: number;

  @ApiProperty({ example: 450.00, description: 'Final fare amount' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  final_fare: number;

  @ApiPropertyOptional({ example: 13.0827, description: 'Ending latitude' })
  @IsNumber()
  @IsOptional()
  end_lat?: number;

  @ApiPropertyOptional({ example: 80.2707, description: 'Ending longitude' })
  @IsNumber()
  @IsOptional()
  end_lng?: number;

  @ApiPropertyOptional({ example: 'Trip completed successfully', description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
