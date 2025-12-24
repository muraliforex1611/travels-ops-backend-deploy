// =====================================================================
// Companies Service
// =====================================================================

import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { supabase } from '../../config/database.config';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { UpdateCreditDto } from './dto/update-credit.dto';

@Injectable()
export class CompaniesService {
  // ========================================
  // CREATE COMPANY
  // ========================================
  async create(createCompanyDto: CreateCompanyDto, userId?: number) {
    try {
      // Check if company_code already exists
      const { data: existing } = await supabase
        .from('companies')
        .select('company_id')
        .eq('company_code', createCompanyDto.company_code)
        .single();

      if (existing) {
        throw new ConflictException(
          `Company with code ${createCompanyDto.company_code} already exists`,
        );
      }

      // Check if email_domain already exists (if provided)
      if (createCompanyDto.email_domain) {
        const { data: existingDomain } = await supabase
          .from('companies')
          .select('company_id')
          .eq('email_domain', createCompanyDto.email_domain)
          .single();

        if (existingDomain) {
          throw new ConflictException(
            `Email domain ${createCompanyDto.email_domain} is already registered`,
          );
        }
      }

      const companyData = {
        ...createCompanyDto,
        current_outstanding: 0,
        created_by: userId,
      };

      const { data, error } = await supabase
        .from('companies')
        .insert(companyData)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Company created successfully',
        data: data,
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error(`Failed to create company: ${error.message}`);
    }
  }

  // ========================================
  // GET ALL COMPANIES (with filters)
  // ========================================
  async findAll(filters?: {
    is_active?: boolean;
    has_credit_limit?: boolean;
    email_domain?: string;
    search?: string;
  }) {
    try {
      let query = supabase
        .from('companies')
        .select(
          `
          *,
          preferred_category:vehicle_categories(
            category_id,
            category_name
          )
        `,
        )
        .order('company_name', { ascending: true });

      // Apply filters
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      }

      if (filters?.has_credit_limit) {
        query = query.gt('credit_limit', 0);
      }

      if (filters?.email_domain) {
        query = query.eq('email_domain', filters.email_domain);
      }

      if (filters?.search) {
        query = query.or(
          `company_name.ilike.%${filters.search}%,company_code.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%`,
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Calculate credit utilization for each company
      const companiesWithMetrics = data.map((company) => ({
        ...company,
        credit_utilization_percentage:
          company.credit_limit > 0
            ? Math.round(
                (company.current_outstanding / company.credit_limit) * 100,
              )
            : 0,
        credit_available:
          company.credit_limit - company.current_outstanding || 0,
      }));

      return {
        success: true,
        count: companiesWithMetrics.length,
        data: companiesWithMetrics,
      };
    } catch (error) {
      throw new Error(`Failed to fetch companies: ${error.message}`);
    }
  }

  // ========================================
  // GET ONE COMPANY BY ID
  // ========================================
  async findOne(id: number) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(
          `
          *,
          preferred_category:vehicle_categories(
            category_id,
            category_name,
            base_fare_per_km
          ),
          created_by_user:users!companies_created_by_fkey(
            user_id,
            full_name,
            email
          )
        `,
        )
        .eq('company_id', id)
        .single();

      if (error || !data) {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }

      // Calculate metrics
      const companyWithMetrics = {
        ...data,
        credit_utilization_percentage:
          data.credit_limit > 0
            ? Math.round((data.current_outstanding / data.credit_limit) * 100)
            : 0,
        credit_available: data.credit_limit - data.current_outstanding || 0,
      };

      return {
        success: true,
        data: companyWithMetrics,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch company: ${error.message}`);
    }
  }

  // ========================================
  // GET COMPANY BY CODE
  // ========================================
  async findByCode(companyCode: string) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('company_code', companyCode)
        .single();

      if (error || !data) {
        throw new NotFoundException(
          `Company with code ${companyCode} not found`,
        );
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch company: ${error.message}`);
    }
  }

  // ========================================
  // GET COMPANY BY EMAIL DOMAIN
  // ========================================
  async findByEmailDomain(email: string) {
    try {
      const emailDomain = '@' + email.split('@')[1];

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('email_domain', emailDomain)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return {
          success: false,
          message: 'No company found for this email domain',
          data: null,
        };
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to lookup company by email',
        data: null,
      };
    }
  }

  // ========================================
  // UPDATE COMPANY
  // ========================================
  async update(id: number, updateCompanyDto: UpdateCompanyDto) {
    try {
      // Check if company exists
      await this.findOne(id);

      // If updating company_code, check for conflicts
      if (updateCompanyDto.company_code) {
        const { data: existing } = await supabase
          .from('companies')
          .select('company_id')
          .eq('company_code', updateCompanyDto.company_code)
          .neq('company_id', id)
          .single();

        if (existing) {
          throw new ConflictException(
            `Company code ${updateCompanyDto.company_code} is already in use`,
          );
        }
      }

      // If updating email_domain, check for conflicts
      if (updateCompanyDto.email_domain) {
        const { data: existingDomain } = await supabase
          .from('companies')
          .select('company_id')
          .eq('email_domain', updateCompanyDto.email_domain)
          .neq('company_id', id)
          .single();

        if (existingDomain) {
          throw new ConflictException(
            `Email domain ${updateCompanyDto.email_domain} is already registered`,
          );
        }
      }

      const { data, error } = await supabase
        .from('companies')
        .update(updateCompanyDto)
        .eq('company_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Company updated successfully',
        data: data,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error(`Failed to update company: ${error.message}`);
    }
  }

  // ========================================
  // UPDATE CREDIT LIMIT AND OUTSTANDING
  // ========================================
  async updateCredit(id: number, updateCreditDto: UpdateCreditDto) {
    try {
      const company = await this.findOne(id);

      const updates: any = {};

      // Update credit limit
      if (updateCreditDto.credit_limit !== undefined) {
        updates.credit_limit = updateCreditDto.credit_limit;
      }

      // Adjust outstanding amount
      if (updateCreditDto.outstanding_adjustment !== undefined) {
        const newOutstanding =
          company.data.current_outstanding +
          updateCreditDto.outstanding_adjustment;

        if (newOutstanding < 0) {
          throw new BadRequestException(
            'Outstanding amount cannot be negative',
          );
        }

        updates.current_outstanding = newOutstanding;
      }

      if (Object.keys(updates).length === 0) {
        throw new BadRequestException('No updates provided');
      }

      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('company_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // TODO: Log credit adjustment in a separate credit_transactions table

      return {
        success: true,
        message: 'Credit updated successfully',
        data: data,
        adjustment_details: updateCreditDto.adjustment_reason,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new Error(`Failed to update credit: ${error.message}`);
    }
  }

  // ========================================
  // CHECK CREDIT AVAILABILITY
  // ========================================
  async checkCreditAvailability(companyId: number, requestedAmount: number) {
    try {
      const company = await this.findOne(companyId);

      const creditAvailable =
        company.data.credit_limit - company.data.current_outstanding;

      return {
        success: true,
        data: {
          company_id: companyId,
          company_name: company.data.company_name,
          credit_limit: company.data.credit_limit,
          current_outstanding: company.data.current_outstanding,
          credit_available: creditAvailable,
          requested_amount: requestedAmount,
          is_approved: requestedAmount <= creditAvailable,
          excess_amount:
            requestedAmount > creditAvailable
              ? requestedAmount - creditAvailable
              : 0,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to check credit: ${error.message}`);
    }
  }

  // ========================================
  // DEACTIVATE COMPANY
  // ========================================
  async deactivate(id: number) {
    try {
      await this.findOne(id);

      const { data, error } = await supabase
        .from('companies')
        .update({ is_active: false })
        .eq('company_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Company deactivated successfully',
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to deactivate company: ${error.message}`);
    }
  }

  // ========================================
  // ACTIVATE COMPANY
  // ========================================
  async activate(id: number) {
    try {
      await this.findOne(id);

      const { data, error } = await supabase
        .from('companies')
        .update({ is_active: true })
        .eq('company_id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        success: true,
        message: 'Company activated successfully',
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to activate company: ${error.message}`);
    }
  }

  // ========================================
  // GET COMPANY BOOKINGS
  // ========================================
  async getCompanyBookings(
    companyId: number,
    filters?: {
      status?: string;
      from_date?: string;
      to_date?: string;
      limit?: number;
    },
  ) {
    try {
      await this.findOne(companyId);

      let query = supabase
        .from('bookings')
        .select(
          `
          *,
          driver:drivers(driver_id, full_name, mobile_primary),
          vehicle:vehicles(vehicle_id, registration_number, make, model)
        `,
        )
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.from_date) {
        query = query.gte('pickup_datetime', filters.from_date);
      }

      if (filters?.to_date) {
        query = query.lte('pickup_datetime', filters.to_date);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Calculate total amounts
      const totalBookings = data.length;
      const totalAmount = data.reduce(
        (sum, booking) => sum + (booking.estimated_fare || 0),
        0,
      );
      const totalActual = data.reduce(
        (sum, booking) => sum + (booking.actual_fare || 0),
        0,
      );

      return {
        success: true,
        count: totalBookings,
        total_estimated: totalAmount,
        total_actual: totalActual,
        data: data,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch company bookings: ${error.message}`);
    }
  }

  // ========================================
  // GET COMPANY STATISTICS
  // ========================================
  async getCompanyStats(companyId: number, month?: string, year?: string) {
    try {
      await this.findOne(companyId);

      // Build date filter
      let dateFilter = '';
      if (year && month) {
        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        const endDate = `${year}-${month.padStart(2, '0')}-31`;
        dateFilter = `pickup_datetime.gte.${startDate},pickup_datetime.lte.${endDate}`;
      } else if (year) {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;
        dateFilter = `pickup_datetime.gte.${startDate},pickup_datetime.lte.${endDate}`;
      }

      let query = supabase
        .from('bookings')
        .select('status, estimated_fare, actual_fare, payment_status')
        .eq('company_id', companyId);

      if (dateFilter) {
        const dates = dateFilter.split(',');
        dates.forEach((filter) => {
          const [field, operator, value] = filter.split('.');
          if (operator === 'gte') {
            query = query.gte(field, value);
          } else if (operator === 'lte') {
            query = query.lte(field, value);
          }
        });
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Calculate statistics
      const stats = {
        total_bookings: data.length,
        bookings_by_status: {} as Record<string, number>,
        total_estimated_amount: 0,
        total_actual_amount: 0,
        payment_pending: 0,
        payment_completed: 0,
      };

      data.forEach((booking) => {
        // Count by status
        stats.bookings_by_status[booking.status] =
          (stats.bookings_by_status[booking.status] || 0) + 1;

        // Sum amounts
        stats.total_estimated_amount += booking.estimated_fare || 0;
        stats.total_actual_amount += booking.actual_fare || 0;

        // Payment status
        if (booking.payment_status === 'pending') {
          stats.payment_pending += booking.actual_fare || booking.estimated_fare || 0;
        } else if (booking.payment_status === 'paid') {
          stats.payment_completed += booking.actual_fare || 0;
        }
      });

      return {
        success: true,
        period: {
          month: month || 'all',
          year: year || 'all',
        },
        data: stats,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch company statistics: ${error.message}`);
    }
  }
}
