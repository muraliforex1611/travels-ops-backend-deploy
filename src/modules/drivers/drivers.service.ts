// =====================================================================
// WEEK 2 - DAY 10: Drivers Service
// =====================================================================
// File Location: src/modules/drivers/drivers.service.ts
// Purpose: Database operations for drivers
// Instructions: Copy this entire file and paste in VS Code
// =====================================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../../config/database.config';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  // ========================================
  // GET ALL DRIVERS (with filters)
  // ========================================
  async findAll(filters?: {
    status?: string;
    isActive?: boolean;
    search?: string;
  }) {
    try {
      let query = supabase
        .from('drivers')
        .select(`
          *,
          driver_vehicle_mapping(
            vehicle:vehicles(
              vehicle_id,
              registration_number,
              category:vehicle_categories(category_name)
            )
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('current_status', filters.status);
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,mobile_primary.ilike.%${filters.search}%,license_number.ilike.%${filters.search}%`,
        );
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
      throw new Error(`Failed to fetch drivers: ${error.message}`);
    }
  }

  // ========================================
  // GET ONE DRIVER BY ID
  // ========================================
  async findOne(id: number) {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select(
          `
          *,
          driver_vehicle_mapping(
            vehicle:vehicles(
              vehicle_id,
              registration_number,
              make,
              model,
              category:vehicle_categories(category_name)
            )
          )
        `,
        )
        .eq('driver_id', id)
        .single();

      if (error || !data) {
        throw new NotFoundException(`Driver with ID ${id} not found`);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch driver: ${error.message}`);
    }
  }

  // ========================================
  // GET AVAILABLE DRIVERS
  // ========================================
  async findAvailable(date?: string, time?: string) {
    try {
      let query = supabase
        .from('drivers')
        .select('*')
        .eq('is_active', true)
        .eq('is_blacklisted', false)
        .in('current_status', ['available', 'on_break']);

      const { data, error } = await query;

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        count: data.length,
        data: data,
        availableAt: date && time ? `${date} ${time}` : 'now',
      };
    } catch (error) {
      throw new Error(`Failed to fetch available drivers: ${error.message}`);
    }
  }

  // ========================================
  // CREATE NEW DRIVER
  // ========================================
  async create(createDriverDto: CreateDriverDto) {
    try {
      // Generate driver code
      const driverCode = await this.generateDriverCode();

      const driverData = {
        ...createDriverDto,
        driver_code: driverCode,
        current_status: 'available',
        is_active: true,
        trips_today: 0,
        hours_worked_today: 0,
      };

      const { data, error } = await supabase
        .from('drivers')
        .insert(driverData)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Driver created successfully',
        data: data,
      };
    } catch (error) {
      throw new Error(`Failed to create driver: ${error.message}`);
    }
  }

  // ========================================
  // UPDATE DRIVER
  // ========================================
  async update(id: number, updateDriverDto: UpdateDriverDto) {
    try {
      // Check if driver exists
      await this.findOne(id);

      const { data, error } = await supabase
        .from('drivers')
        .update(updateDriverDto)
        .eq('driver_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Driver updated successfully',
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update driver: ${error.message}`);
    }
  }

  // ========================================
  // UPDATE DRIVER STATUS
  // ========================================
  async updateStatus(id: number, status: string) {
    try {
      const validStatuses = [
        'available',
        'on_trip',
        'on_break',
        'off_duty',
        'blocked',
      ];

      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      const { data, error } = await supabase
        .from('drivers')
        .update({ current_status: status })
        .eq('driver_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: `Driver status updated to ${status}`,
        data: data,
      };
    } catch (error) {
      throw new Error(`Failed to update driver status: ${error.message}`);
    }
  }

  // ========================================
  // DELETE DRIVER (Soft Delete)
  // ========================================
  async remove(id: number) {
    try {
      // Check if driver exists
      await this.findOne(id);

      const { data, error } = await supabase
        .from('drivers')
        .update({ is_active: false })
        .eq('driver_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Driver deactivated successfully',
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to deactivate driver: ${error.message}`);
    }
  }

  // ========================================
  // HELPER: Generate Driver Code
  // ========================================
  private async generateDriverCode(): Promise<string> {
    try {
      const { count } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true });

      const nextNumber = (count || 0) + 1;
      return `DRV${String(nextNumber).padStart(3, '0')}`;
    } catch (error) {
      return `DRV${Date.now()}`;
    }
  }
}

// =====================================================================
// HOW TO USE THIS SERVICE:
// =====================================================================
// 1. Copy this entire file
// 2. Create file: src/modules/drivers/drivers.service.ts
// 3. Paste this code
// 4. Save (Ctrl+S)
// 5. Continue to Day 11 (Controller)
// =====================================================================
