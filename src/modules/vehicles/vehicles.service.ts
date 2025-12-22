// =====================================================================
// WEEK 2 - DAY 10: Vehicles Service
// =====================================================================
// File Location: src/modules/vehicles/vehicles.service.ts
// Purpose: Database operations for vehicles
// Instructions: Copy this entire file and paste in VS Code
// =====================================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../../config/database.config';

@Injectable()
export class VehiclesService {
  // ========================================
  // GET ALL VEHICLES (with filters)
  // ========================================
  async findAll(filters?: {
    status?: string;
    isActive?: boolean;
    search?: string;
    categoryId?: number;
  }) {
    try {
      let query = supabase
        .from('vehicles')
        .select(`
          *,
          category:vehicle_categories(
            category_id,
            category_name
          ),
          driver_vehicle_mapping(
            driver:drivers(
              driver_id,
              full_name,
              mobile_primary,
              current_status
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

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters?.search) {
        query = query.or(
          `registration_number.ilike.%${filters.search}%,make.ilike.%${filters.search}%,model.ilike.%${filters.search}%`,
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
      throw new Error(`Failed to fetch vehicles: ${error.message}`);
    }
  }

  // ========================================
  // GET ONE VEHICLE BY ID
  // ========================================
  async findOne(id: number) {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(
          `
          *,
          category:vehicle_categories(
            category_id,
            category_name
          ),
          driver_vehicle_mapping(
            driver:drivers(
              driver_id,
              full_name,
              mobile_primary,
              current_status,
              license_number
            )
          )
        `,
        )
        .eq('vehicle_id', id)
        .single();

      if (error || !data) {
        throw new NotFoundException(`Vehicle with ID ${id} not found`);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch vehicle: ${error.message}`);
    }
  }

  // ========================================
  // GET AVAILABLE VEHICLES
  // ========================================
  async findAvailable(categoryId?: number) {
    try {
      let query = supabase
        .from('vehicles')
        .select(`
          *,
          category:vehicle_categories(
            category_id,
            category_name
          )
        `)
        .eq('is_active', true)
        .in('current_status', ['available', 'idle']);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
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
      throw new Error(`Failed to fetch available vehicles: ${error.message}`);
    }
  }

  // ========================================
  // GET VEHICLE CATEGORIES
  // ========================================
  async findCategories() {
    try {
      const { data, error } = await supabase
        .from('vehicle_categories')
        .select('*')
        .order('category_id', { ascending: true });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        count: data.length,
        data: data,
      };
    } catch (error) {
      throw new Error(`Failed to fetch vehicle categories: ${error.message}`);
    }
  }

  // ========================================
  // CREATE NEW VEHICLE
  // ========================================
  async create(createVehicleDto: any) {
    try {
      const vehicleData = {
        ...createVehicleDto,
        current_status: 'available',
        is_active: true,
        trips_today: 0,
        mileage_today: 0,
      };

      const { data, error } = await supabase
        .from('vehicles')
        .insert(vehicleData)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Vehicle created successfully',
        data: data,
      };
    } catch (error) {
      throw new Error(`Failed to create vehicle: ${error.message}`);
    }
  }

  // ========================================
  // UPDATE VEHICLE
  // ========================================
  async update(id: number, updateVehicleDto: any) {
    try {
      // Check if vehicle exists
      await this.findOne(id);

      const { data, error } = await supabase
        .from('vehicles')
        .update(updateVehicleDto)
        .eq('vehicle_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Vehicle updated successfully',
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update vehicle: ${error.message}`);
    }
  }

  // ========================================
  // UPDATE VEHICLE STATUS
  // ========================================
  async updateStatus(id: number, status: string) {
    try {
      const validStatuses = [
        'available',
        'on_trip',
        'in_service',
        'maintenance',
        'breakdown',
        'idle',
        'blocked',
      ];

      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
      }

      const { data, error } = await supabase
        .from('vehicles')
        .update({ current_status: status })
        .eq('vehicle_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: `Vehicle status updated to ${status}`,
        data: data,
      };
    } catch (error) {
      throw new Error(`Failed to update vehicle status: ${error.message}`);
    }
  }

  // ========================================
  // UPDATE VEHICLE MILEAGE
  // ========================================
  async updateMileage(id: number, mileage: number) {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update({ current_mileage: mileage })
        .eq('vehicle_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Vehicle mileage updated successfully',
        data: data,
      };
    } catch (error) {
      throw new Error(`Failed to update vehicle mileage: ${error.message}`);
    }
  }

  // ========================================
  // DELETE VEHICLE (Soft Delete)
  // ========================================
  async remove(id: number) {
    try {
      // Check if vehicle exists
      await this.findOne(id);

      const { data, error } = await supabase
        .from('vehicles')
        .update({ is_active: false })
        .eq('vehicle_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Vehicle deactivated successfully',
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to deactivate vehicle: ${error.message}`);
    }
  }
}

// =====================================================================
// HOW TO USE THIS SERVICE:
// =====================================================================
// 1. Copy this entire file
// 2. Create file: src/modules/vehicles/vehicles.service.ts
// 3. Paste this code
// 4. Save (Ctrl+S)
// 5. Continue to Day 11 (Controller)
// =====================================================================
