// =====================================================================
// Booking Type Definitions
// =====================================================================

export interface Booking {
  booking_id: number;
  booking_code: string;
  customer_name: string;
  customer_mobile: string;
  customer_email?: string | null;
  pickup_location: string;
  pickup_lat?: number | null;
  pickup_lng?: number | null;
  drop_location: string;
  drop_lat?: number | null;
  drop_lng?: number | null;
  pickup_datetime: string;
  vehicle_category_id: number;
  passengers: number;
  distance_km?: number | null;
  estimated_fare?: number | null;
  actual_fare?: number | null;
  driver_id?: number | null;
  vehicle_id?: number | null;
  status: BookingStatus;
  payment_status?: PaymentStatus;
  special_requirements?: string | null;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'paid' | 'partial';

export interface CreateBookingDTO {
  customer_name: string;
  customer_mobile: string;
  customer_email?: string;
  pickup_location: string;
  pickup_lat?: number;
  pickup_lng?: number;
  drop_location: string;
  drop_lat?: number;
  drop_lng?: number;
  pickup_datetime: string;
  vehicle_category_id: number;
  passengers: number;
  distance_km?: number;
  estimated_fare?: number;
  special_requirements?: string;
}

export interface UpdateBookingDTO {
  customer_name?: string;
  customer_mobile?: string;
  customer_email?: string;
  pickup_location?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  drop_location?: string;
  drop_lat?: number;
  drop_lng?: number;
  pickup_datetime?: string;
  vehicle_category_id?: number;
  passengers?: number;
  distance_km?: number;
  estimated_fare?: number;
  actual_fare?: number;
  driver_id?: number;
  vehicle_id?: number;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  special_requirements?: string;
}

export interface BookingResponse {
  success: boolean;
  message?: string;
  data?: Booking | Booking[];
  count?: number;
  error?: string;
}
