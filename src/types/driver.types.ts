// =====================================================================
// Driver Type Definitions
// =====================================================================

export interface Driver {
  driver_id: number;
  full_name: string;
  mobile_primary: string;
  mobile_secondary?: string | null;
  email?: string | null;
  date_of_birth?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  license_number: string;
  license_type: string;
  license_expiry_date: string;
  license_status: LicenseStatus;
  experience_years?: number | null;
  blood_group?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_mobile?: string | null;
  current_status: DriverStatus;
  joining_date?: string | null;
  aadhar_number?: string | null;
  bank_account_number?: string | null;
  bank_ifsc_code?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type LicenseStatus = 'valid' | 'expired' | 'suspended';
export type DriverStatus = 'available' | 'on_trip' | 'off_duty' | 'inactive';

export interface CreateDriverDTO {
  full_name: string;
  mobile_primary: string;
  mobile_secondary?: string;
  email?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  license_number: string;
  license_type: string;
  license_expiry_date: string;
  experience_years?: number;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_mobile?: string;
  joining_date?: string;
  aadhar_number?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  notes?: string;
}

export interface UpdateDriverDTO {
  full_name?: string;
  mobile_primary?: string;
  mobile_secondary?: string;
  email?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  license_number?: string;
  license_type?: string;
  license_expiry_date?: string;
  license_status?: LicenseStatus;
  experience_years?: number;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_mobile?: string;
  current_status?: DriverStatus;
  joining_date?: string;
  aadhar_number?: string;
  bank_account_number?: string;
  bank_ifsc_code?: string;
  notes?: string;
}

export interface DriverResponse {
  success: boolean;
  message?: string;
  data?: Driver | Driver[];
  count?: number;
  error?: string;
}
