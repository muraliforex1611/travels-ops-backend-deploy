// =====================================================================
// Bookings Controller
// =====================================================================

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ========================================
  // GET /api/v1/bookings
  // Get all bookings (with optional filters)
  // ========================================
  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'payment_status', required: false, description: 'Filter by payment status' })
  @ApiQuery({ name: 'customer_mobile', required: false, description: 'Filter by customer mobile' })
  @ApiQuery({ name: 'from_date', required: false, description: 'Filter from date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to_date', required: false, description: 'Filter to date (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Bookings list retrieved successfully' })
  async findAll(
    @Query('status') status?: string,
    @Query('payment_status') payment_status?: string,
    @Query('customer_mobile') customer_mobile?: string,
    @Query('from_date') from_date?: string,
    @Query('to_date') to_date?: string,
  ) {
    const filters = {
      status,
      payment_status,
      customer_mobile,
      from_date,
      to_date,
    };

    return await this.bookingsService.findAll(filters);
  }

  // ========================================
  // GET /api/v1/bookings/:id
  // Get single booking by ID
  // ========================================
  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking found' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.bookingsService.findOne(id);
  }

  // ========================================
  // POST /api/v1/bookings
  // Create new booking
  // ========================================
  @Post()
  @ApiOperation({ summary: 'Create new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async create(@Body() createBookingDto: CreateBookingDto) {
    return await this.bookingsService.create(createBookingDto);
  }

  // ========================================
  // PUT /api/v1/bookings/:id
  // Update booking
  // ========================================
  @Put(':id')
  @ApiOperation({ summary: 'Update booking' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return await this.bookingsService.update(id, updateBookingDto);
  }

  // ========================================
  // PUT /api/v1/bookings/:id/status
  // Update booking status only
  // ========================================
  @Put(':id/status')
  @ApiOperation({ summary: 'Update booking status' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'confirmed', 'driver_assigned', 'in_progress', 'completed', 'cancelled'],
          example: 'confirmed'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return await this.bookingsService.updateStatus(id, status);
  }

  // ========================================
  // PUT /api/v1/bookings/:id/assign
  // Assign driver and vehicle to booking
  // ========================================
  @Put(':id/assign')
  @ApiOperation({ summary: 'Assign driver and vehicle to booking' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        driver_id: { type: 'number', example: 1 },
        vehicle_id: { type: 'number', example: 1 }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Driver and vehicle assigned successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async assignDriverAndVehicle(
    @Param('id', ParseIntPipe) id: number,
    @Body('driver_id', ParseIntPipe) driver_id: number,
    @Body('vehicle_id', ParseIntPipe) vehicle_id: number,
  ) {
    return await this.bookingsService.assignDriverAndVehicle(id, driver_id, vehicle_id);
  }

  // ========================================
  // DELETE /api/v1/bookings/:id
  // Cancel booking
  // ========================================
  @Delete(':id')
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async cancel(@Param('id', ParseIntPipe) id: number) {
    return await this.bookingsService.cancel(id);
  }
}

// =====================================================================
// API ENDPOINTS CREATED:
// =====================================================================
// GET    /api/v1/bookings              → Get all bookings
// GET    /api/v1/bookings/:id          → Get single booking
// POST   /api/v1/bookings              → Create booking
// PUT    /api/v1/bookings/:id          → Update booking
// PUT    /api/v1/bookings/:id/status   → Update status
// PUT    /api/v1/bookings/:id/assign   → Assign driver/vehicle
// DELETE /api/v1/bookings/:id          → Cancel booking
// =====================================================================
