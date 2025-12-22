// =====================================================================
// Bookings Service
// =====================================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../../config/database.config';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  // ========================================
  // GET ALL BOOKINGS (with filters)
  // ========================================
  async findAll(filters?: {
    status?: string;
    payment_status?: string;
    customer_mobile?: string;
    from_date?: string;
    to_date?: string;
  }) {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          driver:drivers(
            driver_id,
            full_name,
            mobile_primary,
            current_status
          ),
          vehicle:vehicles(
            vehicle_id,
            registration_number,
            make,
            model
          ),
          category:vehicle_categories(
            category_id,
            category_name
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.payment_status) {
        query = query.eq('payment_status', filters.payment_status);
      }

      if (filters?.customer_mobile) {
        query = query.ilike('customer_mobile', `%${filters.customer_mobile}%`);
      }

      if (filters?.from_date) {
        query = query.gte('pickup_datetime', filters.from_date);
      }

      if (filters?.to_date) {
        query = query.lte('pickup_datetime', filters.to_date);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        count: data.length,
        data: data,
      };
    } catch (error) {
      throw new Error(`Failed to fetch bookings: ${error.message}`);
    }
  }

  // ========================================
  // GET ONE BOOKING BY ID
  // ========================================
  async findOne(id: number) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          driver:drivers(
            driver_id,
            full_name,
            mobile_primary,
            license_number,
            current_status
          ),
          vehicle:vehicles(
            vehicle_id,
            registration_number,
            make,
            model,
            color
          ),
          category:vehicle_categories(
            category_id,
            category_name
          )
        `)
        .eq('booking_id', id)
        .single();

      if (error || !data) {
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch booking: ${error.message}`);
    }
  }

  // ========================================
  // CREATE NEW BOOKING
  // ========================================
  async create(createBookingDto: CreateBookingDto) {
    try {
      // Generate booking code
      const bookingCode = await this.generateBookingCode();

      // Calculate estimated fare (basic calculation)
      const estimatedFare = this.calculateEstimatedFare(
        createBookingDto.distance_km || 0,
        createBookingDto.vehicle_category_id,
      );

      const bookingData = {
        ...createBookingDto,
        booking_code: bookingCode,
        estimated_fare: estimatedFare,
        status: 'pending',
        payment_status: 'pending',
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Booking created successfully',
        data: data,
      };
    } catch (error) {
      throw new Error(`Failed to create booking: ${error.message}`);
    }
  }

  // ========================================
  // UPDATE BOOKING
  // ========================================
  async update(id: number, updateBookingDto: UpdateBookingDto) {
    try {
      // Check if booking exists
      await this.findOne(id);

      const { data, error } = await supabase
        .from('bookings')
        .update(updateBookingDto)
        .eq('booking_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Booking updated successfully',
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update booking: ${error.message}`);
    }
  }

  // ========================================
  // UPDATE BOOKING STATUS
  // ========================================
  async updateStatus(id: number, status: string) {
    try {
      const validStatuses = [
        'pending',
        'confirmed',
        'driver_assigned',
        'in_progress',
        'completed',
        'cancelled',
      ];

      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      const { data, error } = await supabase
        .from('bookings')
        .update({ status: status })
        .eq('booking_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: `Booking status updated to ${status}`,
        data: data,
      };
    } catch (error) {
      throw new Error(`Failed to update booking status: ${error.message}`);
    }
  }

  // ========================================
  // ASSIGN DRIVER & VEHICLE
  // ========================================
  async assignDriverAndVehicle(
    id: number,
    driver_id: number,
    vehicle_id: number,
  ) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          driver_id: driver_id,
          vehicle_id: vehicle_id,
          status: 'driver_assigned',
        })
        .eq('booking_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Driver and vehicle assigned successfully',
        data: data,
      };
    } catch (error) {
      throw new Error(`Failed to assign driver and vehicle: ${error.message}`);
    }
  }

  // ========================================
  // CANCEL BOOKING
  // ========================================
  async cancel(id: number) {
    try {
      // Check if booking exists
      await this.findOne(id);

      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('booking_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Booking cancelled successfully',
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to cancel booking: ${error.message}`);
    }
  }

  // ========================================
  // HELPER: Generate Booking Code
  // ========================================
  private async generateBookingCode(): Promise<string> {
    try {
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      const nextNumber = (count || 0) + 1;
      return `BKG${String(nextNumber).padStart(5, '0')}`;
    } catch (error) {
      return `BKG${Date.now()}`;
    }
  }

  // ========================================
  // HELPER: Calculate Estimated Fare
  // ========================================
  private calculateEstimatedFare(
    distance_km: number,
    vehicle_category_id: number,
  ): number {
    // Basic fare calculation
    // TODO: Fetch actual rates from vehicle_categories table
    const baseRatePerKm = 15; // Default rate
    const baseFare = 50; // Minimum fare

    if (distance_km <= 0) {
      return baseFare;
    }

    const calculatedFare = baseFare + distance_km * baseRatePerKm;
    return Math.round(calculatedFare * 100) / 100; // Round to 2 decimals
  }
}
