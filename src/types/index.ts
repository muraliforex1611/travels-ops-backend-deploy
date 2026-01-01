// =====================================================================
// Centralized Type Exports
// =====================================================================

export * from './booking.types';
export * from './customer.types';
export * from './driver.types';
export * from './vehicle.types';
export * from './trip.types';

// Common API Response Type
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
