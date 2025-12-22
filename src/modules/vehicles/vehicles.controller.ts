// =====================================================================
// WEEK 2 - DAY 11: Vehicles Controller
// =====================================================================
// File Location: src/modules/vehicles/vehicles.controller.ts
// Purpose: API endpoints for vehicles
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
import { VehiclesService } from './vehicles.service';

@ApiTags('Vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  // ========================================
  // GET /api/v1/vehicles
  // Get all vehicles (with optional filters)
  // ========================================
  @Get()
  @ApiOperation({ summary: 'Get all vehicles' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by category ID',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by registration, make, or model',
  })
  @ApiResponse({ status: 200, description: 'Vehicles list retrieved successfully' })
  async findAll(
    @Query('status') status?: string,
    @Query('isActive') isActive?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    const filters = {
      status,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      search,
    };

    return await this.vehiclesService.findAll(filters);
  }

  // ========================================
  // GET /api/v1/vehicles/available
  // Get available vehicles (for trip assignment)
  // ========================================
  @Get('available')
  @ApiOperation({ summary: 'Get available vehicles' })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category' })
  @ApiResponse({
    status: 200,
    description: 'Available vehicles retrieved successfully',
  })
  async findAvailable(@Query('categoryId') categoryId?: string) {
    return await this.vehiclesService.findAvailable(
      categoryId ? parseInt(categoryId) : undefined,
    );
  }

  // ========================================
  // GET /api/v1/vehicles/categories
  // Get all vehicle categories
  // ========================================
  @Get('categories')
  @ApiOperation({ summary: 'Get all vehicle categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async findCategories() {
    return await this.vehiclesService.findCategories();
  }

  // ========================================
  // GET /api/v1/vehicles/:id
  // Get single vehicle by ID
  // ========================================
  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiResponse({ status: 200, description: 'Vehicle found' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.vehiclesService.findOne(id);
  }

  // ========================================
  // POST /api/v1/vehicles
  // Create new vehicle
  // ========================================
  @Post()
  @ApiOperation({ summary: 'Create new vehicle' })
  @ApiResponse({ status: 201, description: 'Vehicle created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async create(@Body() createVehicleDto: any) {
    return await this.vehiclesService.create(createVehicleDto);
  }

  // ========================================
  // PUT /api/v1/vehicles/:id
  // Update vehicle
  // ========================================
  @Put(':id')
  @ApiOperation({ summary: 'Update vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle updated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleDto: any,
  ) {
    return await this.vehiclesService.update(id, updateVehicleDto);
  }

  // ========================================
  // PUT /api/v1/vehicles/:id/status
  // Update vehicle status only
  // ========================================
  @Put(':id/status')
  @ApiOperation({ summary: 'Update vehicle status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return await this.vehiclesService.updateStatus(id, status);
  }

  // ========================================
  // PUT /api/v1/vehicles/:id/mileage
  // Update vehicle mileage
  // ========================================
  @Put(':id/mileage')
  @ApiOperation({ summary: 'Update vehicle mileage' })
  @ApiResponse({ status: 200, description: 'Mileage updated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async updateMileage(
    @Param('id', ParseIntPipe) id: number,
    @Body('mileage') mileage: number,
  ) {
    return await this.vehiclesService.updateMileage(id, mileage);
  }

  // ========================================
  // DELETE /api/v1/vehicles/:id
  // Deactivate vehicle (soft delete)
  // ========================================
  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate vehicle' })
  @ApiResponse({ status: 200, description: 'Vehicle deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.vehiclesService.remove(id);
  }
}

// =====================================================================
// API ENDPOINTS CREATED:
// =====================================================================
// GET    /api/v1/vehicles              → Get all vehicles
// GET    /api/v1/vehicles/available    → Get available vehicles
// GET    /api/v1/vehicles/:id          → Get single vehicle
// POST   /api/v1/vehicles              → Create vehicle
// PUT    /api/v1/vehicles/:id          → Update vehicle
// PUT    /api/v1/vehicles/:id/status   → Update status
// PUT    /api/v1/vehicles/:id/mileage  → Update mileage
// DELETE /api/v1/vehicles/:id          → Deactivate vehicle
// =====================================================================

// =====================================================================
// HOW TO USE THIS CONTROLLER:
// =====================================================================
// 1. Copy this entire file
// 2. Create file: src/modules/vehicles/vehicles.controller.ts
// 3. Paste this code
// 4. Save (Ctrl+S)
// 5. Continue to Day 12 (Module)
// =====================================================================
