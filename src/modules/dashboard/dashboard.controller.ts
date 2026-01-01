// =====================================================================
// Dashboard Controller - API Endpoints for Dashboard
// =====================================================================

import { Controller, Get, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  private readonly logger = new Logger(DashboardController.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @Get('statistics')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  async getStatistics() {
    this.logger.log('GET /dashboard/statistics');
    return this.dashboardService.getStatistics();
  }

  @Get('booking-trend')
  @ApiOperation({ summary: 'Get booking trend for last N days' })
  @ApiQuery({ name: 'days', required: false, type: Number, example: 30 })
  @ApiResponse({
    status: 200,
    description: 'Booking trend retrieved successfully',
  })
  async getBookingTrend(@Query('days') days?: string) {
    const numDays = days ? parseInt(days, 10) : 30;
    this.logger.log(`GET /dashboard/booking-trend?days=${numDays}`);
    return this.dashboardService.getBookingTrend(numDays);
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent activity (bookings, trips, customers)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Recent activity retrieved successfully',
  })
  async getRecentActivity(@Query('limit') limit?: string) {
    const numLimit = limit ? parseInt(limit, 10) : 10;
    this.logger.log(`GET /dashboard/recent-activity?limit=${numLimit}`);
    return this.dashboardService.getRecentActivity(numLimit);
  }

  @Get('vehicle-utilization')
  @ApiOperation({ summary: 'Get vehicle utilization statistics' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle utilization retrieved successfully',
  })
  async getVehicleUtilization() {
    this.logger.log('GET /dashboard/vehicle-utilization');
    return this.dashboardService.getVehicleUtilization();
  }

  @Get('booking-status')
  @ApiOperation({ summary: 'Get booking status breakdown' })
  @ApiResponse({
    status: 200,
    description: 'Booking status breakdown retrieved successfully',
  })
  async getBookingStatusBreakdown() {
    this.logger.log('GET /dashboard/booking-status');
    return this.dashboardService.getBookingStatusBreakdown();
  }
}
