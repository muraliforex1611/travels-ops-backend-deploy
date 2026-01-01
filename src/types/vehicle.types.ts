// =====================================================================
// Vehicle Type Definitions
// =====================================================================

export interface Vehicle {
  vehicle_id: number;
  registration_number: string;
  make: string;
  model: string;
  year?: number | null;
  color?: string | null;
  category_id: number;
  seating_capacity?: number | null;
  fuel_type?: FuelType | null;
  insurance_expiry_date?: string | null;
  fitness_certificate_expiry?: string | null;
  permit_expiry_date?: string | null;
  pollution_certificate_expiry?: string | null;
  current_status: VehicleStatus;
  current_driver_id?: number | null;
  owner_name?: string | null;
  owner_mobile?: string | null;
  purchase_date?: string | null;
  chassis_number?: string | null;
  engine_number?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type FuelType = 'petrol' | 'diesel' | 'cng' | 'electric' | 'hybrid';
export type VehicleStatus = 'available' | 'on_trip' | 'maintenance' | 'inactive';

export interface CreateVehicleDTO {
  registration_number: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  category_id: number;
  seating_capacity?: number;
  fuel_type?: FuelType;
  insurance_expiry_date?: string;
  fitness_certificate_expiry?: string;
  permit_expiry_date?: string;
  pollution_certificate_expiry?: string;
  owner_name?: string;
  owner_mobile?: string;
  purchase_date?: string;
  chassis_number?: string;
  engine_number?: string;
  notes?: string;
}

export interface UpdateVehicleDTO {
  registration_number?: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  category_id?: number;
  seating_capacity?: number;
  fuel_type?: FuelType;
  insurance_expiry_date?: string;
  fitness_certificate_expiry?: string;
  permit_expiry_date?: string;
  pollution_certificate_expiry?: string;
  current_status?: VehicleStatus;
  current_driver_id?: number;
  owner_name?: string;
  owner_mobile?: string;
  purchase_date?: string;
  chassis_number?: string;
  engine_number?: string;
  notes?: string;
}

export interface VehicleResponse {
  success: boolean;
  message?: string;
  data?: Vehicle | Vehicle[];
  count?: number;
  error?: string;
}
