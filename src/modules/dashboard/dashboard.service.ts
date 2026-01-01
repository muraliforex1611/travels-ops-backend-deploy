// =====================================================================
// Dashboard Service - Business Logic for Dashboard Analytics
// =====================================================================

import { Injectable, Logger } from '@nestjs/common';
import { supabase } from '../../config/database.config';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  /**
   * Get dashboard statistics (today, week, month)
   */
  async getStatistics() {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get bookings statistics
      const { data: allBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('booking_id, created_at, status, estimated_fare, actual_fare');

      if (bookingsError) throw bookingsError;

      // Calculate statistics
      const todayBookings = allBookings.filter(
        (b) => new Date(b.created_at) >= today,
      );
      const weekBookings = allBookings.filter(
        (b) => new Date(b.created_at) >= weekAgo,
      );
      const monthBookings = allBookings.filter(
        (b) => new Date(b.created_at) >= monthAgo,
      );

      // Get active trips count
      const { data: activeTrips, error: tripsError } = await supabase
        .from('trips')
        .select('trip_id')
        .in('status', ['assigned', 'started', 'in_progress']);

      if (tripsError) throw tripsError;

      // Get pending bookings count
      const { data: pendingBookings, error: pendingError } = await supabase
        .from('bookings')
        .select('booking_id')
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Get available drivers count
      const { data: availableDrivers, error: driversError } = await supabase
        .from('drivers')
        .select('driver_id')
        .eq('current_status', 'available');

      if (driversError) throw driversError;

      // Get available vehicles count
      const { data: availableVehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('vehicle_id')
        .eq('current_status', 'available');

      if (vehiclesError) throw vehiclesError;

      // Calculate revenue (estimated for now, actual when payment is done)
      const calculateRevenue = (bookings: any[]) => {
        return bookings.reduce((sum, b) => {
          const fare = b.actual_fare || b.estimated_fare || 0;
          return sum + Number(fare);
        }, 0);
      };

      const statistics = {
        today: {
          bookings: todayBookings.length,
          revenue: calculateRevenue(todayBookings),
        },
        week: {
          bookings: weekBookings.length,
          revenue: calculateRevenue(weekBookings),
        },
        month: {
          bookings: monthBookings.length,
          revenue: calculateRevenue(monthBookings),
        },
        active_trips: activeTrips?.length || 0,
        pending_bookings: pendingBookings?.length || 0,
        available_drivers: availableDrivers?.length || 0,
        available_vehicles: availableVehicles?.length || 0,
        total_bookings: allBookings?.length || 0,
      };

      this.logger.log('Dashboard statistics retrieved successfully');
      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      this.logger.error('Error fetching dashboard statistics', error);
      throw error;
    }
  }

  /**
   * Get booking trend for last N days
   */
  async getBookingTrend(days: number = 30) {
    try {
      const now = new Date();
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('booking_id, created_at, estimated_fare, actual_fare')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      // Group bookings by date
      const trendMap = new Map<string, { count: number; revenue: number }>();

      // Initialize all dates with 0
      for (let i = 0; i < days; i++) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        trendMap.set(dateStr, { count: 0, revenue: 0 });
      }

      // Count bookings per date
      bookings?.forEach((booking) => {
        const dateStr = booking.created_at.split('T')[0];
        if (trendMap.has(dateStr)) {
          const current = trendMap.get(dateStr)!;
          const fare = booking.actual_fare || booking.estimated_fare || 0;
          trendMap.set(dateStr, {
            count: current.count + 1,
            revenue: current.revenue + Number(fare),
          });
        }
      });

      // Convert to array and sort by date
      const trend = Array.from(trendMap.entries())
        .map(([date, stats]) => ({
          date,
          count: stats.count,
          revenue: stats.revenue,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      this.logger.log(`Booking trend for ${days} days retrieved successfully`);
      return {
        success: true,
        data: trend,
      };
    } catch (error) {
      this.logger.error('Error fetching booking trend', error);
      throw error;
    }
  }

  /**
   * Get recent activity (last 10 bookings, trips, customers)
   */
  async getRecentActivity(limit: number = 10) {
    try {
      // Get recent bookings
      const { data: recentBookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (bookingsError) throw bookingsError;

      // Get recent trips
      const { data: recentTrips, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (tripsError) throw tripsError;

      // Get recent customers
      const { data: recentCustomers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (customersError) throw customersError;

      this.logger.log('Recent activity retrieved successfully');
      return {
        success: true,
        data: {
          bookings: recentBookings || [],
          trips: recentTrips || [],
          customers: recentCustomers || [],
        },
      };
    } catch (error) {
      this.logger.error('Error fetching recent activity', error);
      throw error;
    }
  }

  /**
   * Get vehicle utilization statistics
   */
  async getVehicleUtilization() {
    try {
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('vehicle_id, current_status');

      if (error) throw error;

      const utilization = {
        available: 0,
        on_trip: 0,
        maintenance: 0,
        inactive: 0,
      };

      vehicles?.forEach((vehicle) => {
        const status = vehicle.current_status || 'inactive';
        if (status in utilization) {
          utilization[status as keyof typeof utilization]++;
        }
      });

      this.logger.log('Vehicle utilization retrieved successfully');
      return {
        success: true,
        data: utilization,
      };
    } catch (error) {
      this.logger.error('Error fetching vehicle utilization', error);
      throw error;
    }
  }

  /**
   * Get booking status breakdown
   */
  async getBookingStatusBreakdown() {
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('booking_id, status');

      if (error) throw error;

      const breakdown = {
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
      };

      bookings?.forEach((booking) => {
        const status = booking.status || 'pending';
        if (status in breakdown) {
          breakdown[status as keyof typeof breakdown]++;
        }
      });

      this.logger.log('Booking status breakdown retrieved successfully');
      return {
        success: true,
        data: breakdown,
      };
    } catch (error) {
      this.logger.error('Error fetching booking status breakdown', error);
      throw error;
    }
  }
}
