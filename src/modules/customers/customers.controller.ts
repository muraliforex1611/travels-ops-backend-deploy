// =====================================================================
// Customers Controller
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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // ========================================
  // GET /api/v1/customers
  // Get all customers (with optional filters)
  // ========================================
  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiQuery({ name: 'customerType', required: false, description: 'Filter by customer type' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name, phone, or email',
  })
  @ApiResponse({ status: 200, description: 'Customers list retrieved successfully' })
  async findAll(
    @Query('customerType') customerType?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    const filters = {
      customerType,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      search,
    };

    return await this.customersService.findAll(filters);
  }

  // ========================================
  // GET /api/v1/customers/search
  // Search customers
  // ========================================
  @Get('search')
  @ApiOperation({ summary: 'Search customers' })
  @ApiQuery({ name: 'q', required: true, description: 'Search term' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  async search(@Query('q') searchTerm: string) {
    return await this.customersService.search(searchTerm);
  }

  // ========================================
  // GET /api/v1/customers/:id
  // Get single customer by ID
  // ========================================
  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer found' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.customersService.findOne(id);
  }

  // ========================================
  // GET /api/v1/customers/:id/bookings
  // Get customer booking history
  // ========================================
  @Get(':id/bookings')
  @ApiOperation({ summary: 'Get customer booking history' })
  @ApiResponse({ status: 200, description: 'Booking history retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findCustomerBookings(@Param('id', ParseIntPipe) id: number) {
    return await this.customersService.findCustomerBookings(id);
  }

  // ========================================
  // POST /api/v1/customers
  // Create new customer
  // ========================================
  @Post()
  @ApiOperation({ summary: 'Register new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return await this.customersService.create(createCustomerDto);
  }

  // ========================================
  // PUT /api/v1/customers/:id
  // Update customer
  // ========================================
  @Put(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return await this.customersService.update(id, updateCustomerDto);
  }

  // ========================================
  // DELETE /api/v1/customers/:id
  // Deactivate customer (soft delete)
  // ========================================
  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate customer' })
  @ApiResponse({ status: 200, description: 'Customer deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.customersService.remove(id);
  }
}

// =====================================================================
// API ENDPOINTS CREATED:
// =====================================================================
// GET    /api/v1/customers              → Get all customers
// GET    /api/v1/customers/search       → Search customers
// GET    /api/v1/customers/:id          → Get single customer
// GET    /api/v1/customers/:id/bookings → Get customer bookings
// POST   /api/v1/customers              → Create customer
// PUT    /api/v1/customers/:id          → Update customer
// DELETE /api/v1/customers/:id          → Deactivate customer
// =====================================================================
