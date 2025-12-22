// =====================================================================
// Update Location DTO
// =====================================================================

import {
  IsNumber,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLocationDto {
  @ApiProperty({ example: 13.0827, description: 'Current latitude' })
  @IsNumber()
  @IsNotEmpty()
  @Min(-90)
  @Max(90)
  current_lat: number;

  @ApiProperty({ example: 80.2707, description: 'Current longitude' })
  @IsNumber()
  @IsNotEmpty()
  @Min(-180)
  @Max(180)
  current_lng: number;

  @ApiPropertyOptional({ example: 45, description: 'Current speed in km/h' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  current_speed?: number;

  @ApiPropertyOptional({ example: 85.5, description: 'Current heading/bearing in degrees' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(360)
  heading?: number;
}
