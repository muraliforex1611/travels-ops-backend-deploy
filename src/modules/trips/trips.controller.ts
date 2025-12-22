// =====================================================================
// Trips Controller
// =====================================================================

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { StartTripDto } from './dto/start-trip.dto';
import { CompleteTripDto } from './dto/complete-trip.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CancelTripDto } from './dto/cancel-trip.dto';

@ApiTags('Trips')
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  // ========================================
  // GET /api/v1/trips
  // Get all trips (with optional filters)
  // ========================================
  @Get()
  @ApiOperation({ summary: 'Get all trips' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by trip status' })
  @ApiQuery({ name: 'driverId', required: false, description: 'Filter by driver ID' })
  @ApiQuery({ name: 'vehicleId', required: false, description: 'Filter by vehicle ID' })
  @ApiQuery({ name: 'date', required: false, description: 'Filter by date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Trips list retrieved successfully' })
  async findAll(
    @Query('status') status?: string,
    @Query('driverId') driverId?: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('date') date?: string,
  ) {
    const filters = {
      status,
      driverId: driverId ? parseInt(driverId) : undefined,
      vehicleId: vehicleId ? parseInt(vehicleId) : undefined,
      date,
    };

    return await this.tripsService.findAll(filters);
  }

  // ========================================
  // GET /api/v1/trips/active
  // Get all active trips
  // ========================================
  @Get('active')
  @ApiOperation({ summary: 'Get all active trips' })
  @ApiResponse({ status: 200, description: 'Active trips retrieved successfully' })
  async findActive() {
    return await this.tripsService.findActive();
  }

  // ========================================
  // GET /api/v1/trips/:id
  // Get single trip by ID
  // ========================================
  @Get(':id')
  @ApiOperation({ summary: 'Get trip by ID' })
  @ApiResponse({ status: 200, description: 'Trip found' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.tripsService.findOne(id);
  }

  // ========================================
  // GET /api/v1/trips/:id/route
  // Get trip route history
  // ========================================
  @Get(':id/route')
  @ApiOperation({ summary: 'Get trip route/GPS history' })
  @ApiResponse({ status: 200, description: 'Route history retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  async getRoute(@Param('id', ParseIntPipe) id: number) {
    return await this.tripsService.getRoute(id);
  }

  // ========================================
  // POST /api/v1/trips/start
  // Start a new trip from booking
  // ========================================
  @Post('start')
  @ApiOperation({ summary: 'Start a new trip from booking' })
  @ApiResponse({ status: 201, description: 'Trip started successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or booking not ready' })
  async startTrip(@Body() startTripDto: StartTripDto) {
    return await this.tripsService.startTrip(startTripDto);
  }

  // ========================================
  // PUT /api/v1/trips/:id/location
  // Update trip GPS location
  // ========================================
  @Put(':id/location')
  @ApiOperation({ summary: 'Update trip GPS location' })
  @ApiResponse({ status: 200, description: 'Location updated successfully' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  @ApiResponse({ status: 400, description: 'Trip is not active' })
  async updateLocation(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return await this.tripsService.updateLocation(id, updateLocationDto);
  }

  // ========================================
  // PUT /api/v1/trips/:id/complete
  // Complete a trip
  // ========================================
  @Put(':id/complete')
  @ApiOperation({ summary: 'Complete a trip' })
  @ApiResponse({ status: 200, description: 'Trip completed successfully' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  @ApiResponse({ status: 400, description: 'Trip cannot be completed' })
  async completeTrip(
    @Param('id', ParseIntPipe) id: number,
    @Body() completeTripDto: CompleteTripDto,
  ) {
    return await this.tripsService.completeTrip(id, completeTripDto);
  }

  // ========================================
  // PUT /api/v1/trips/:id/cancel
  // Cancel a trip
  // ========================================
  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel a trip' })
  @ApiResponse({ status: 200, description: 'Trip cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  @ApiResponse({ status: 400, description: 'Trip cannot be cancelled' })
  async cancelTrip(
    @Param('id', ParseIntPipe) id: number,
    @Body() cancelTripDto: CancelTripDto,
  ) {
    return await this.tripsService.cancelTrip(id, cancelTripDto);
  }
}

// =====================================================================
// API ENDPOINTS CREATED:
// =====================================================================
// GET    /api/v1/trips              → Get all trips
// GET    /api/v1/trips/active       → Get active trips
// GET    /api/v1/trips/:id          → Get single trip
// GET    /api/v1/trips/:id/route    → Get trip route/GPS history
// POST   /api/v1/trips/start        → Start trip from booking
// PUT    /api/v1/trips/:id/location → Update GPS location
// PUT    /api/v1/trips/:id/complete → Complete trip
// PUT    /api/v1/trips/:id/cancel   → Cancel trip
// =====================================================================
