// =====================================================================
// Customer Type Definitions
// =====================================================================

export interface Customer {
  customer_id: number;
  name: string;
  mobile: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  id_proof_type?: string | null;
  id_proof_number?: string | null;
  status: CustomerStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type CustomerStatus = 'active' | 'inactive' | 'blocked';

export interface CreateCustomerDTO {
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  notes?: string;
}

export interface UpdateCustomerDTO {
  name?: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  id_proof_type?: string;
  id_proof_number?: string;
  status?: CustomerStatus;
  notes?: string;
}

export interface CustomerResponse {
  success: boolean;
  message?: string;
  data?: Customer | Customer[];
  count?: number;
  error?: string;
}
