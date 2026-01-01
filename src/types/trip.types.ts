// =====================================================================
// Trip Type Definitions
// =====================================================================

export interface Trip {
  trip_id: number;
  booking_id: number;
  driver_id: number;
  vehicle_id: number;
  trip_code: string;
  status: TripStatus;
  assigned_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  start_km_reading?: number | null;
  end_km_reading?: number | null;
  total_km?: number | null;
  start_location?: string | null;
  end_location?: string | null;
  driver_notes?: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export type TripStatus =
  | 'assigned'
  | 'started'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface CreateTripDTO {
  booking_id: number;
  driver_id: number;
  vehicle_id: number;
}

export interface UpdateTripDTO {
  status?: TripStatus;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  start_km_reading?: number;
  end_km_reading?: number;
  total_km?: number;
  start_location?: string;
  end_location?: string;
  driver_notes?: string;
  cancellation_reason?: string;
}

export interface TripResponse {
  success: boolean;
  message?: string;
  data?: Trip | Trip[];
  count?: number;
  error?: string;
}

export interface TripTimeline {
  trip_id: number;
  events: TripEvent[];
}

export interface TripEvent {
  status: TripStatus;
  timestamp: string;
  notes?: string;
}
