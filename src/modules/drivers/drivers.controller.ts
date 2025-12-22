// =====================================================================
// WEEK 2 - DAY 11: Drivers Controller
// =====================================================================
// File Location: src/modules/drivers/drivers.controller.ts
// Purpose: API endpoints for drivers
// Instructions: Copy this entire file and paste in VS Code
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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@ApiTags('Drivers')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  // ========================================
  // GET /api/v1/drivers
  // Get all drivers (with optional filters)
  // ========================================
  @Get()
  @ApiOperation({ summary: 'Get all drivers' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name, phone, or license',
  })
  @ApiResponse({ status: 200, description: 'Drivers list retrieved successfully' })
  async findAll(
    @Query('status') status?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    const filters = {
      status,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      search,
    };

    return await this.driversService.findAll(filters);
  }

  // ========================================
  // GET /api/v1/drivers/available
  // Get available drivers (for trip assignment)
  // ========================================
  @Get('available')
  @ApiOperation({ summary: 'Get available drivers' })
  @ApiQuery({ name: 'date', required: false, description: 'Check availability for date' })
  @ApiQuery({ name: 'time', required: false, description: 'Check availability for time' })
  @ApiResponse({
    status: 200,
    description: 'Available drivers retrieved successfully',
  })
  async findAvailable(@Query('date') date?: string, @Query('time') time?: string) {
    return await this.driversService.findAvailable(date, time);
  }

  // ========================================
  // GET /api/v1/drivers/:id
  // Get single driver by ID
  // ========================================
  @Get(':id')
  @ApiOperation({ summary: 'Get driver by ID' })
  @ApiResponse({ status: 200, description: 'Driver found' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.driversService.findOne(id);
  }

  // ========================================
  // POST /api/v1/drivers
  // Create new driver
  // ========================================
  @Post()
  @ApiOperation({ summary: 'Create new driver' })
  @ApiResponse({ status: 201, description: 'Driver created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async create(@Body() createDriverDto: CreateDriverDto) {
    return await this.driversService.create(createDriverDto);
  }

  // ========================================
  // PUT /api/v1/drivers/:id
  // Update driver
  // ========================================
  @Put(':id')
  @ApiOperation({ summary: 'Update driver' })
  @ApiResponse({ status: 200, description: 'Driver updated successfully' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDriverDto: UpdateDriverDto,
  ) {
    return await this.driversService.update(id, updateDriverDto);
  }

  // ========================================
  // PUT /api/v1/drivers/:id/status
  // Update driver status only
  // ========================================
  @Put(':id/status')
  @ApiOperation({ summary: 'Update driver status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return await this.driversService.updateStatus(id, status);
  }

  // ========================================
  // DELETE /api/v1/drivers/:id
  // Deactivate driver (soft delete)
  // ========================================
  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate driver' })
  @ApiResponse({ status: 200, description: 'Driver deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.driversService.remove(id);
  }
}

// =====================================================================
// API ENDPOINTS CREATED:
// =====================================================================
// GET    /api/v1/drivers              → Get all drivers
// GET    /api/v1/drivers/available    → Get available drivers
// GET    /api/v1/drivers/:id          → Get single driver
// POST   /api/v1/drivers              → Create driver
// PUT    /api/v1/drivers/:id          → Update driver
// PUT    /api/v1/drivers/:id/status   → Update status
// DELETE /api/v1/drivers/:id          → Deactivate driver
// =====================================================================

// =====================================================================
// HOW TO USE THIS CONTROLLER:
// =====================================================================
// 1. Copy this entire file
// 2. Create file: src/modules/drivers/drivers.controller.ts
// 3. Paste this code
// 4. Save (Ctrl+S)
// 5. Continue to Day 12 (Module)
// =====================================================================
