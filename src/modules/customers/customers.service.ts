// =====================================================================
// Customers Service
// =====================================================================

import { Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../../config/database.config';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  // ========================================
  // GET ALL CUSTOMERS (with filters)
  // ========================================
  async findAll(filters?: {
    customerType?: string;
    isActive?: boolean;
    search?: string;
  }) {
    try {
      let query = supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.customerType) {
        query = query.eq('customer_type', filters.customerType);
      }

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,mobile_primary.ilike.%${filters.search}%,email.ilike.%${filters.search}%`,
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
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }
  }

  // ========================================
  // GET ONE CUSTOMER BY ID
  // ========================================
  async findOne(id: number) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_id', id)
        .single();

      if (error || !data) {
        throw new NotFoundException(`Customer with ID ${id} not found`);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch customer: ${error.message}`);
    }
  }

  // ========================================
  // GET CUSTOMER BOOKINGS
  // ========================================
  async findCustomerBookings(id: number) {
    try {
      // First check if customer exists
      await this.findOne(id);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          driver:drivers(driver_id, full_name, mobile_primary),
          vehicle:vehicles(vehicle_id, registration_number, make, model),
          category:vehicle_categories(category_id, category_name)
        `)
        .eq('customer_mobile', (await this.findOne(id)).data.mobile_primary)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        count: data.length,
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch customer bookings: ${error.message}`);
    }
  }

  // ========================================
  // CREATE NEW CUSTOMER
  // ========================================
  async create(createCustomerDto: CreateCustomerDto) {
    try {
      // Generate customer code
      const customerCode = await this.generateCustomerCode();

      const customerData = {
        ...createCustomerDto,
        customer_code: customerCode,
        customer_type: createCustomerDto.customer_type || 'individual',
        is_active: true,
        total_bookings: 0,
        total_spent: 0,
        average_rating: 5.0,
      };

      const { data, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Customer created successfully',
        data: data,
      };
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  // ========================================
  // UPDATE CUSTOMER
  // ========================================
  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    try {
      // Check if customer exists
      await this.findOne(id);

      const { data, error } = await supabase
        .from('customers')
        .update(updateCustomerDto)
        .eq('customer_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Customer updated successfully',
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update customer: ${error.message}`);
    }
  }

  // ========================================
  // SEARCH CUSTOMERS
  // ========================================
  async search(searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(
          `full_name.ilike.%${searchTerm}%,mobile_primary.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`,
        )
        .eq('is_active', true)
        .limit(20);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        count: data.length,
        data: data,
        searchTerm: searchTerm,
      };
    } catch (error) {
      throw new Error(`Failed to search customers: ${error.message}`);
    }
  }

  // ========================================
  // DEACTIVATE CUSTOMER (Soft Delete)
  // ========================================
  async remove(id: number) {
    try {
      // Check if customer exists
      await this.findOne(id);

      const { data, error } = await supabase
        .from('customers')
        .update({ is_active: false })
        .eq('customer_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Customer deactivated successfully',
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to deactivate customer: ${error.message}`);
    }
  }

  // ========================================
  // GENERATE CUSTOMER CODE
  // ========================================
  private async generateCustomerCode(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('customer_code')
        .order('customer_id', { ascending: false })
        .limit(1);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return 'CUST0001';
      }

      const lastCode = data[0].customer_code;
      const lastNumber = parseInt(lastCode.replace('CUST', ''));
      const newNumber = lastNumber + 1;
      return `CUST${newNumber.toString().padStart(4, '0')}`;
    } catch (error) {
      return 'CUST0001';
    }
  }
}
