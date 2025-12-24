import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AllocationService } from './allocation.service';
import { AllocationRequestDto } from './dto/allocation-request.dto';
import { AllocationResultDto } from './dto/allocation-result.dto';

@ApiTags('Allocation')
@Controller('allocation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AllocationController {
  constructor(private readonly allocationService: AllocationService) {}

  @Post('allocate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Allocate vehicle and driver for booking',
    description:
      'Smart allocation algorithm that finds the best vehicle/driver match based on availability, distance, rating, cost, and fuel level',
  })
  @ApiResponse({
    status: 200,
    description: 'Allocation completed (check success flag in response)',
    type: AllocationResultDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async allocate(
    @Body() request: AllocationRequestDto,
    @Request() req,
  ): Promise<AllocationResultDto> {
    const userId = req.user.userId;
    return this.allocationService.allocateVehicleAndDriver(request, userId);
  }

  @Post('release/:vehicleId/:driverId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Release allocated vehicle and driver',
    description:
      'Marks vehicle and driver as available again (called when trip completes or cancels)',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle and driver released successfully',
  })
  async release(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Param('driverId', ParseIntPipe) driverId: number,
  ): Promise<{ message: string }> {
    await this.allocationService.releaseAllocation(vehicleId, driverId);
    return {
      message: `Vehicle ${vehicleId} and driver ${driverId} released successfully`,
    };
  }

  @Get('history/:bookingId')
  @ApiOperation({
    summary: 'Get allocation history for booking',
    description:
      'Returns all allocation attempts for a booking including scores and rule used',
  })
  @ApiResponse({
    status: 200,
    description: 'Allocation history retrieved',
  })
  async getHistory(
    @Param('bookingId', ParseIntPipe) bookingId: number,
  ): Promise<any[]> {
    return this.allocationService.getAllocationHistory(bookingId);
  }
}
