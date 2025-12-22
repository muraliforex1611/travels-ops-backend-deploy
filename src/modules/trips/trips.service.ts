// =====================================================================
// Trips Service
// =====================================================================

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabase } from '../../config/database.config';
import { StartTripDto } from './dto/start-trip.dto';
import { CompleteTripDto } from './dto/complete-trip.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CancelTripDto } from './dto/cancel-trip.dto';

@Injectable()
export class TripsService {
  // ========================================
  // GET ALL TRIPS (with filters)
  // ========================================
  async findAll(filters?: {
    status?: string;
    driverId?: number;
    vehicleId?: number;
    date?: string;
  }) {
    try {
      let query = supabase
        .from('trips')
        .select(`
          *,
          booking:bookings(
            booking_code,
            customer_name,
            customer_mobile,
            pickup_location,
            drop_location
          ),
          driver:drivers(driver_id, full_name, mobile_primary),
          vehicle:vehicles(vehicle_id, registration_number, make, model)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.driverId) {
        query = query.eq('driver_id', filters.driverId);
      }

      if (filters?.vehicleId) {
        query = query.eq('vehicle_id', filters.vehicleId);
      }

      if (filters?.date) {
        const startOfDay = `${filters.date}T00:00:00`;
        const endOfDay = `${filters.date}T23:59:59`;
        query = query.gte('start_time', startOfDay).lte('start_time', endOfDay);
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
      throw new Error(`Failed to fetch trips: ${error.message}`);
    }
  }

  // ========================================
  // GET ONE TRIP BY ID
  // ========================================
  async findOne(id: number) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          booking:bookings(
            booking_code,
            customer_name,
            customer_mobile,
            customer_email,
            pickup_location,
            drop_location,
            estimated_fare
          ),
          driver:drivers(driver_id, full_name, mobile_primary, driver_code),
          vehicle:vehicles(vehicle_id, registration_number, make, model, vehicle_code)
        `)
        .eq('trip_id', id)
        .single();

      if (error || !data) {
        throw new NotFoundException(`Trip with ID ${id} not found`);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch trip: ${error.message}`);
    }
  }

  // ========================================
  // GET ACTIVE TRIPS
  // ========================================
  async findActive() {
    try {
      const { data, error} = await supabase
        .from('trips')
        .select(`
          *,
          booking:bookings(booking_code, customer_name, pickup_location, drop_location),
          driver:drivers(driver_id, full_name, mobile_primary),
          vehicle:vehicles(vehicle_id, registration_number, make, model)
        `)
        .in('status', ['in_progress', 'started'])
        .order('start_time', { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        count: data.length,
        data: data,
      };
    } catch (error) {
      throw new Error(`Failed to fetch active trips: ${error.message}`);
    }
  }

  // ========================================
  // START TRIP FROM BOOKING
  // ========================================
  async startTrip(startTripDto: StartTripDto) {
    try {
      // Get booking details
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_id', startTripDto.booking_id)
        .single();

      if (bookingError || !booking) {
        throw new BadRequestException('Booking not found');
      }

      if (booking.status !== 'driver_assigned' && booking.status !== 'confirmed') {
        throw new BadRequestException(`Cannot start trip. Booking status is: ${booking.status}`);
      }

      // Generate trip code
      const tripCode = await this.generateTripCode();

      const tripData = {
        trip_code: tripCode,
        booking_id: startTripDto.booking_id,
        driver_id: booking.driver_id,
        vehicle_id: booking.vehicle_id,
        status: 'in_progress',
        start_time: new Date().toISOString(),
        start_odometer: startTripDto.start_odometer,
        start_lat: startTripDto.start_lat,
        start_lng: startTripDto.start_lng,
        current_lat: startTripDto.start_lat,
        current_lng: startTripDto.start_lng,
        notes: startTripDto.notes,
      };

      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .insert(tripData)
        .select()
        .single();

      if (tripError) {
        throw new Error(`Database error: ${tripError.message}`);
      }

      // Update booking status
      await supabase
        .from('bookings')
        .update({ status: 'in_progress' })
        .eq('booking_id', startTripDto.booking_id);

      return {
        success: true,
        message: 'Trip started successfully',
        data: trip,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to start trip: ${error.message}`);
    }
  }

  // ========================================
  // UPDATE TRIP LOCATION (GPS)
  // ========================================
  async updateLocation(id: number, updateLocationDto: UpdateLocationDto) {
    try {
      // Check if trip exists and is active
      const trip = await this.findOne(id);

      if (trip.data.status !== 'in_progress') {
        throw new BadRequestException('Can only update location for active trips');
      }

      // Store location in route history
      const locationData = {
        trip_id: id,
        latitude: updateLocationDto.current_lat,
        longitude: updateLocationDto.current_lng,
        speed: updateLocationDto.current_speed,
        heading: updateLocationDto.heading,
        recorded_at: new Date().toISOString(),
      };

      await supabase
        .from('trip_locations')
        .insert(locationData);

      // Update trip current location
      const { data, error } = await supabase
        .from('trips')
        .update({
          current_lat: updateLocationDto.current_lat,
          current_lng: updateLocationDto.current_lng,
          last_location_update: new Date().toISOString(),
        })
        .eq('trip_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Location updated successfully',
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to update location: ${error.message}`);
    }
  }

  // ========================================
  // GET TRIP ROUTE HISTORY
  // ========================================
  async getRoute(id: number) {
    try {
      // Check if trip exists
      await this.findOne(id);

      const { data, error } = await supabase
        .from('trip_locations')
        .select('*')
        .eq('trip_id', id)
        .order('recorded_at', { ascending: true });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        count: data.length,
        data: data,
        tripId: id,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch trip route: ${error.message}`);
    }
  }

  // ========================================
  // COMPLETE TRIP
  // ========================================
  async completeTrip(id: number, completeTripDto: CompleteTripDto) {
    try {
      const trip = await this.findOne(id);

      if (trip.data.status !== 'in_progress') {
        throw new BadRequestException(`Cannot complete trip. Status is: ${trip.data.status}`);
      }

      const { data, error } = await supabase
        .from('trips')
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
          end_odometer: completeTripDto.end_odometer,
          end_lat: completeTripDto.end_lat,
          end_lng: completeTripDto.end_lng,
          distance_traveled: completeTripDto.distance_traveled,
          final_fare: completeTripDto.final_fare,
          notes: completeTripDto.notes || trip.data.notes,
        })
        .eq('trip_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Update booking status and actual fare
      await supabase
        .from('bookings')
        .update({
          status: 'completed',
          actual_fare: completeTripDto.final_fare,
        })
        .eq('booking_id', trip.data.booking_id);

      return {
        success: true,
        message: 'Trip completed successfully',
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to complete trip: ${error.message}`);
    }
  }

  // ========================================
  // CANCEL TRIP
  // ========================================
  async cancelTrip(id: number, cancelTripDto: CancelTripDto) {
    try {
      const trip = await this.findOne(id);

      if (trip.data.status === 'completed' || trip.data.status === 'cancelled') {
        throw new BadRequestException(`Cannot cancel trip. Status is: ${trip.data.status}`);
      }

      const { data, error } = await supabase
        .from('trips')
        .update({
          status: 'cancelled',
          end_time: new Date().toISOString(),
          cancellation_reason: cancelTripDto.cancellation_reason,
          cancellation_fee: cancelTripDto.cancellation_fee || 0,
        })
        .eq('trip_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Update booking status
      await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
        })
        .eq('booking_id', trip.data.booking_id);

      return {
        success: true,
        message: 'Trip cancelled successfully',
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to cancel trip: ${error.message}`);
    }
  }

  // ========================================
  // GENERATE TRIP CODE
  // ========================================
  private async generateTripCode(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('trip_code')
        .order('trip_id', { ascending: false })
        .limit(1);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return 'TRP0001';
      }

      const lastCode = data[0].trip_code;
      const lastNumber = parseInt(lastCode.replace('TRP', ''));
      const newNumber = lastNumber + 1;
      return `TRP${newNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      return 'TRP0001';
    }
  }
}
