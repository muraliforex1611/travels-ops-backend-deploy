import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { supabase } from '../../config/database.config';
import { AllocationRequestDto } from './dto/allocation-request.dto';
import {
  AllocationResultDto,
  AllocatedVehicleDto,
  AllocatedDriverDto,
  AllocationScoreDto,
} from './dto/allocation-result.dto';

interface AllocationRule {
  rule_id: number;
  rule_name: string;
  weight_availability: number;
  weight_distance: number;
  weight_rating: number;
  weight_cost: number;
  weight_fuel: number;
  conditions: any;
}

interface VehicleCandidate {
  vehicle_id: number;
  registration_number: string;
  make: string;
  model: string;
  category_name: string;
  vehicle_type: string;
  rate_per_km: number;
  current_location_name: string;
  current_latitude: number;
  current_longitude: number;
  fuel_level_percentage: number;
  driver_id: number;
  driver_name: string;
  driver_mobile: string;
  driver_rating: number;
  driver_total_trips: number;
  driver_license: string;
}

@Injectable()
export class AllocationService {
  private readonly logger = new Logger(AllocationService.name);

  /**
   * Main allocation method - finds best vehicle/driver match
   */
  async allocateVehicleAndDriver(
    request: AllocationRequestDto,
    userId: number,
  ): Promise<AllocationResultDto> {
    try {
      this.logger.log(`Starting allocation for booking ${request.booking_id}`);

      // Step 1: Get allocation rule
      const rule = await this.getAllocationRule(request);

      // Step 2: Get available vehicle candidates
      const candidates = await this.getAvailableVehicles(request);

      if (candidates.length === 0) {
        return {
          success: false,
          message: 'No available vehicles found',
          error: 'No vehicles match the criteria or all vehicles are busy',
        };
      }

      // Step 3: Score each candidate
      const scoredCandidates = candidates.map((candidate) =>
        this.scoreCandidate(candidate, request, rule),
      );

      // Step 4: Sort by total score (descending)
      scoredCandidates.sort((a, b) => b.score.total_score - a.score.total_score);

      // Step 5: Select best match
      const bestMatch = scoredCandidates[0];

      // Step 6: Calculate estimated cost
      const estimatedCost = this.calculateEstimatedCost(
        bestMatch.candidate,
        request,
      );

      // Step 7: Log allocation
      const allocationLogId = await this.logAllocation(
        request.booking_id,
        bestMatch.candidate.vehicle_id,
        bestMatch.candidate.driver_id,
        rule.rule_id,
        bestMatch.score,
        estimatedCost,
        userId,
      );

      // Step 8: Update vehicle and driver availability
      await this.updateAvailabilityStatus(
        bestMatch.candidate.vehicle_id,
        bestMatch.candidate.driver_id,
        'on_trip',
      );

      // Step 9: Return result
      return {
        success: true,
        message: 'Vehicle and driver allocated successfully',
        vehicle: {
          vehicle_id: bestMatch.candidate.vehicle_id,
          registration_number: bestMatch.candidate.registration_number,
          make: bestMatch.candidate.make,
          model: bestMatch.candidate.model,
          category_name: bestMatch.candidate.category_name,
          current_location: bestMatch.candidate.current_location_name,
          distance_from_pickup: bestMatch.distance,
          fuel_level: bestMatch.candidate.fuel_level_percentage,
          estimated_cost: estimatedCost,
        },
        driver: {
          driver_id: bestMatch.candidate.driver_id,
          full_name: bestMatch.candidate.driver_name,
          mobile_number: bestMatch.candidate.driver_mobile,
          rating: bestMatch.candidate.driver_rating,
          total_trips: bestMatch.candidate.driver_total_trips,
          license_number: bestMatch.candidate.driver_license,
        },
        score: bestMatch.score,
        allocation_log_id: allocationLogId,
        rule_used: rule.rule_name,
      };
    } catch (error) {
      this.logger.error(`Allocation failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Allocation failed',
        error: error.message,
      };
    }
  }

  /**
   * Get allocation rule based on request parameters
   */
  private async getAllocationRule(
    request: AllocationRequestDto,
  ): Promise<AllocationRule> {
    // If specific rule requested, use it
    if (request.allocation_rule_id) {
      const { data, error } = await supabase
        .from('allocation_rules')
        .select('*')
        .eq('rule_id', request.allocation_rule_id)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        throw new NotFoundException('Allocation rule not found');
      }

      return data;
    }

    // Otherwise, find best matching rule based on trip type and company
    let query = supabase
      .from('allocation_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority_order', { ascending: false });

    // Filter by company if corporate booking
    if (request.company_id) {
      const { data: companyRules } = await query
        .contains('conditions', { company_id: request.company_id });

      if (companyRules && companyRules.length > 0) {
        return companyRules[0];
      }
    }

    // Filter by trip type
    if (request.trip_type) {
      const { data: typeRules } = await query
        .contains('conditions', { booking_type: request.trip_type });

      if (typeRules && typeRules.length > 0) {
        return typeRules[0];
      }
    }

    // Get default rule (highest priority without specific conditions)
    const { data: defaultRules } = await query.limit(1);

    if (!defaultRules || defaultRules.length === 0) {
      // Fallback: create default weights
      return {
        rule_id: 0,
        rule_name: 'Default Rule',
        weight_availability: 1.5,
        weight_distance: 1.3,
        weight_rating: 1.2,
        weight_cost: 1.0,
        weight_fuel: 1.0,
        conditions: {},
      };
    }

    return defaultRules[0];
  }

  /**
   * Get available vehicles matching criteria
   */
  private async getAvailableVehicles(
    request: AllocationRequestDto,
  ): Promise<VehicleCandidate[]> {
    const { data, error } = await supabase
      .from('vehicle_availability')
      .select(
        `
        vehicle_id,
        driver_id,
        current_location_name,
        current_latitude,
        current_longitude,
        fuel_level_percentage,
        vehicles!inner (
          registration_number,
          make,
          model,
          vehicle_type,
          rate_per_km,
          vehicle_categories!inner (
            category_id,
            category_name
          )
        ),
        driver_availability!inner (
          drivers!inner (
            full_name,
            mobile_number,
            license_number
          ),
          rating_average,
          total_ratings
        )
      `,
      )
      .eq('status', 'available')
      .eq('vehicles.category_id', request.vehicle_category_id)
      .eq('driver_availability.status', 'available')
      .eq('driver_availability.is_on_duty', true);

    if (error) {
      this.logger.error(`Error fetching vehicles: ${error.message}`);
      return [];
    }

    // Transform to flat structure
    const candidates: VehicleCandidate[] = (data || []).map((record: any) => ({
      vehicle_id: record.vehicle_id,
      registration_number: record.vehicles.registration_number,
      make: record.vehicles.make,
      model: record.vehicles.model,
      category_name: record.vehicles.vehicle_categories.category_name,
      vehicle_type: record.vehicles.vehicle_type,
      rate_per_km: record.vehicles.rate_per_km,
      current_location_name: record.current_location_name,
      current_latitude: record.current_latitude,
      current_longitude: record.current_longitude,
      fuel_level_percentage: record.fuel_level_percentage,
      driver_id: record.driver_id,
      driver_name: record.driver_availability.drivers.full_name,
      driver_mobile: record.driver_availability.drivers.mobile_number,
      driver_rating: record.driver_availability.rating_average,
      driver_total_trips: record.driver_availability.total_ratings,
      driver_license: record.driver_availability.drivers.license_number,
    }));

    return candidates;
  }

  /**
   * Score a candidate vehicle/driver combination
   */
  private scoreCandidate(
    candidate: VehicleCandidate,
    request: AllocationRequestDto,
    rule: AllocationRule,
  ): { candidate: VehicleCandidate; score: AllocationScoreDto; distance: number } {
    // Calculate distance from pickup
    const distance = this.calculateDistance(
      candidate.current_latitude,
      candidate.current_longitude,
      request.pickup_latitude,
      request.pickup_longitude,
    );

    // Individual scores (0-100 scale)
    const availabilityScore = 100; // Already filtered to available only
    const distanceScore = this.calculateDistanceScore(distance);
    const ratingScore = this.calculateRatingScore(candidate.driver_rating);
    const costScore = this.calculateCostScore(candidate.vehicle_type);
    const fuelScore = this.calculateFuelScore(candidate.fuel_level_percentage);

    // Weighted total score
    const totalScore =
      (availabilityScore * rule.weight_availability +
        distanceScore * rule.weight_distance +
        ratingScore * rule.weight_rating +
        costScore * rule.weight_cost +
        fuelScore * rule.weight_fuel) /
      (rule.weight_availability +
        rule.weight_distance +
        rule.weight_rating +
        rule.weight_cost +
        rule.weight_fuel);

    return {
      candidate,
      distance,
      score: {
        availability_score: availabilityScore,
        distance_score: distanceScore,
        rating_score: ratingScore,
        cost_score: costScore,
        fuel_score: fuelScore,
        total_score: Math.round(totalScore * 10) / 10, // Round to 1 decimal
      },
    };
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Score distance (closer = higher score)
   * 0-5 km: 90-100
   * 5-10 km: 70-90
   * 10-20 km: 40-70
   * >20 km: 0-40
   */
  private calculateDistanceScore(distance: number): number {
    if (distance <= 5) return 100 - distance * 2;
    if (distance <= 10) return 90 - (distance - 5) * 4;
    if (distance <= 20) return 70 - (distance - 10) * 3;
    return Math.max(0, 40 - (distance - 20));
  }

  /**
   * Score rating (0-5 stars to 0-100)
   */
  private calculateRatingScore(rating: number): number {
    return rating * 20; // 5 stars = 100
  }

  /**
   * Score cost (own vehicles score higher than attached)
   */
  private calculateCostScore(vehicleType: string): number {
    if (vehicleType === 'own') return 100;
    if (vehicleType === 'attached') return 70;
    return 50; // rental
  }

  /**
   * Score fuel level
   */
  private calculateFuelScore(fuelLevel: number): number {
    if (fuelLevel >= 70) return 100;
    if (fuelLevel >= 50) return 80;
    if (fuelLevel >= 30) return 60;
    return 40;
  }

  /**
   * Calculate estimated trip cost
   */
  private calculateEstimatedCost(
    candidate: VehicleCandidate,
    request: AllocationRequestDto,
  ): number {
    // Calculate trip distance (simplified - straight line)
    const tripDistance = this.calculateDistance(
      request.pickup_latitude,
      request.pickup_longitude,
      request.drop_latitude,
      request.drop_longitude,
    );

    // Add distance to pickup
    const pickupDistance = this.calculateDistance(
      candidate.current_latitude,
      candidate.current_longitude,
      request.pickup_latitude,
      request.pickup_longitude,
    );

    const totalDistance = tripDistance + pickupDistance;
    const baseCost = totalDistance * candidate.rate_per_km;

    // Add 10% buffer
    return Math.round(baseCost * 1.1 * 100) / 100;
  }

  /**
   * Log allocation to database
   */
  private async logAllocation(
    bookingId: number,
    vehicleId: number,
    driverId: number,
    ruleId: number,
    score: AllocationScoreDto,
    estimatedCost: number,
    userId: number,
  ): Promise<number> {
    const { data, error } = await supabase
      .from('allocation_logs')
      .insert({
        booking_id: bookingId,
        vehicle_id: vehicleId,
        driver_id: driverId,
        allocation_rule_id: ruleId,
        allocation_score: score.total_score,
        score_breakdown: score,
        estimated_cost: estimatedCost,
        allocation_status: 'allocated',
        allocated_by: userId,
      })
      .select('allocation_log_id')
      .single();

    if (error) {
      this.logger.error(`Error logging allocation: ${error.message}`);
      return 0;
    }

    return data.allocation_log_id;
  }

  /**
   * Update vehicle and driver availability status
   */
  private async updateAvailabilityStatus(
    vehicleId: number,
    driverId: number,
    status: string,
  ): Promise<void> {
    // Update vehicle availability
    await supabase
      .from('vehicle_availability')
      .update({ status })
      .eq('vehicle_id', vehicleId);

    // Update driver availability
    await supabase
      .from('driver_availability')
      .update({ status })
      .eq('driver_id', driverId);
  }

  /**
   * Release allocation (when trip completes or cancels)
   */
  async releaseAllocation(
    vehicleId: number,
    driverId: number,
  ): Promise<void> {
    await this.updateAvailabilityStatus(vehicleId, driverId, 'available');
    this.logger.log(`Released allocation for vehicle ${vehicleId} and driver ${driverId}`);
  }

  /**
   * Get allocation history for a booking
   */
  async getAllocationHistory(bookingId: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('allocation_logs')
      .select(
        `
        *,
        vehicles (registration_number, make, model),
        drivers (full_name, mobile_number),
        allocation_rules (rule_name)
      `,
      )
      .eq('booking_id', bookingId)
      .order('allocated_at', { ascending: false });

    if (error) {
      this.logger.error(`Error fetching allocation history: ${error.message}`);
      return [];
    }

    return data || [];
  }
}
