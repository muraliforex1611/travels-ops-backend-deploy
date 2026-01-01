// =====================================================================
// Input Validation Middleware using Joi
// =====================================================================

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Validation wrapper function
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
    }

    next();
  };
};

// =====================================================================
// Booking Validation Schemas
// =====================================================================

export const bookingSchemas = {
  create: Joi.object({
    customer_name: Joi.string().required().min(2).max(100).trim()
      .messages({
        'string.empty': 'Customer name is required',
        'string.min': 'Customer name must be at least 2 characters',
        'string.max': 'Customer name cannot exceed 100 characters',
      }),

    customer_mobile: Joi.string().required().pattern(/^[0-9]{10}$/)
      .messages({
        'string.empty': 'Customer mobile is required',
        'string.pattern.base': 'Mobile number must be 10 digits',
      }),

    customer_email: Joi.string().email().optional().allow(null, '')
      .messages({
        'string.email': 'Invalid email format',
      }),

    pickup_location: Joi.string().required().min(3).max(500).trim()
      .messages({
        'string.empty': 'Pickup location is required',
        'string.min': 'Pickup location must be at least 3 characters',
      }),

    pickup_lat: Joi.number().min(-90).max(90).optional().allow(null),
    pickup_lng: Joi.number().min(-180).max(180).optional().allow(null),

    drop_location: Joi.string().required().min(3).max(500).trim()
      .messages({
        'string.empty': 'Drop location is required',
        'string.min': 'Drop location must be at least 3 characters',
      }),

    drop_lat: Joi.number().min(-90).max(90).optional().allow(null),
    drop_lng: Joi.number().min(-180).max(180).optional().allow(null),

    pickup_datetime: Joi.date().iso().required()
      .messages({
        'date.base': 'Invalid pickup datetime format',
        'any.required': 'Pickup datetime is required',
      }),

    vehicle_category_id: Joi.number().integer().positive().required()
      .messages({
        'number.base': 'Vehicle category ID must be a number',
        'any.required': 'Vehicle category is required',
      }),

    passengers: Joi.number().integer().min(1).max(50).required()
      .messages({
        'number.min': 'Passengers must be at least 1',
        'number.max': 'Passengers cannot exceed 50',
        'any.required': 'Number of passengers is required',
      }),

    distance_km: Joi.number().min(0).max(10000).optional().allow(null),
    estimated_fare: Joi.number().min(0).optional().allow(null),
    special_requirements: Joi.string().max(1000).optional().allow(null, ''),
  }),

  update: Joi.object({
    customer_name: Joi.string().min(2).max(100).trim().optional(),
    customer_mobile: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    customer_email: Joi.string().email().optional().allow(null, ''),
    pickup_location: Joi.string().min(3).max(500).trim().optional(),
    pickup_lat: Joi.number().min(-90).max(90).optional().allow(null),
    pickup_lng: Joi.number().min(-180).max(180).optional().allow(null),
    drop_location: Joi.string().min(3).max(500).trim().optional(),
    drop_lat: Joi.number().min(-90).max(90).optional().allow(null),
    drop_lng: Joi.number().min(-180).max(180).optional().allow(null),
    pickup_datetime: Joi.date().iso().optional(),
    vehicle_category_id: Joi.number().integer().positive().optional(),
    passengers: Joi.number().integer().min(1).max(50).optional(),
    distance_km: Joi.number().min(0).max(10000).optional().allow(null),
    estimated_fare: Joi.number().min(0).optional().allow(null),
    actual_fare: Joi.number().min(0).optional().allow(null),
    driver_id: Joi.number().integer().positive().optional().allow(null),
    vehicle_id: Joi.number().integer().positive().optional().allow(null),
    status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'completed').optional(),
    payment_status: Joi.string().valid('pending', 'paid', 'partial').optional(),
    special_requirements: Joi.string().max(1000).optional().allow(null, ''),
  }).min(1), // At least one field must be provided for update
};

// =====================================================================
// Customer Validation Schemas
// =====================================================================

export const customerSchemas = {
  create: Joi.object({
    name: Joi.string().required().min(2).max(100).trim(),
    mobile: Joi.string().required().pattern(/^[0-9]{10}$/),
    email: Joi.string().email().optional().allow(null, ''),
    address: Joi.string().max(500).optional().allow(null, ''),
    city: Joi.string().max(100).optional().allow(null, ''),
    state: Joi.string().max(100).optional().allow(null, ''),
    pincode: Joi.string().pattern(/^[0-9]{6}$/).optional().allow(null, ''),
    id_proof_type: Joi.string().max(50).optional().allow(null, ''),
    id_proof_number: Joi.string().max(50).optional().allow(null, ''),
    notes: Joi.string().max(1000).optional().allow(null, ''),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100).trim().optional(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    email: Joi.string().email().optional().allow(null, ''),
    address: Joi.string().max(500).optional().allow(null, ''),
    city: Joi.string().max(100).optional().allow(null, ''),
    state: Joi.string().max(100).optional().allow(null, ''),
    pincode: Joi.string().pattern(/^[0-9]{6}$/).optional().allow(null, ''),
    id_proof_type: Joi.string().max(50).optional().allow(null, ''),
    id_proof_number: Joi.string().max(50).optional().allow(null, ''),
    status: Joi.string().valid('active', 'inactive', 'blocked').optional(),
    notes: Joi.string().max(1000).optional().allow(null, ''),
  }).min(1),
};

// =====================================================================
// Driver Validation Schemas
// =====================================================================

export const driverSchemas = {
  create: Joi.object({
    full_name: Joi.string().required().min(2).max(100).trim(),
    mobile_primary: Joi.string().required().pattern(/^[0-9]{10}$/),
    mobile_secondary: Joi.string().pattern(/^[0-9]{10}$/).optional().allow(null, ''),
    email: Joi.string().email().optional().allow(null, ''),
    date_of_birth: Joi.date().iso().optional().allow(null),
    address: Joi.string().max(500).optional().allow(null, ''),
    city: Joi.string().max(100).optional().allow(null, ''),
    state: Joi.string().max(100).optional().allow(null, ''),
    pincode: Joi.string().pattern(/^[0-9]{6}$/).optional().allow(null, ''),
    license_number: Joi.string().required().min(5).max(50).trim(),
    license_type: Joi.string().required().max(50),
    license_expiry_date: Joi.date().iso().required(),
    experience_years: Joi.number().integer().min(0).max(50).optional().allow(null),
    blood_group: Joi.string().max(10).optional().allow(null, ''),
    emergency_contact_name: Joi.string().max(100).optional().allow(null, ''),
    emergency_contact_mobile: Joi.string().pattern(/^[0-9]{10}$/).optional().allow(null, ''),
    joining_date: Joi.date().iso().optional().allow(null),
    aadhar_number: Joi.string().pattern(/^[0-9]{12}$/).optional().allow(null, ''),
    bank_account_number: Joi.string().max(50).optional().allow(null, ''),
    bank_ifsc_code: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).optional().allow(null, ''),
    notes: Joi.string().max(1000).optional().allow(null, ''),
  }),

  update: Joi.object({
    full_name: Joi.string().min(2).max(100).trim().optional(),
    mobile_primary: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    mobile_secondary: Joi.string().pattern(/^[0-9]{10}$/).optional().allow(null, ''),
    email: Joi.string().email().optional().allow(null, ''),
    date_of_birth: Joi.date().iso().optional().allow(null),
    address: Joi.string().max(500).optional().allow(null, ''),
    city: Joi.string().max(100).optional().allow(null, ''),
    state: Joi.string().max(100).optional().allow(null, ''),
    pincode: Joi.string().pattern(/^[0-9]{6}$/).optional().allow(null, ''),
    license_number: Joi.string().min(5).max(50).trim().optional(),
    license_type: Joi.string().max(50).optional(),
    license_expiry_date: Joi.date().iso().optional(),
    license_status: Joi.string().valid('valid', 'expired', 'suspended').optional(),
    experience_years: Joi.number().integer().min(0).max(50).optional().allow(null),
    blood_group: Joi.string().max(10).optional().allow(null, ''),
    emergency_contact_name: Joi.string().max(100).optional().allow(null, ''),
    emergency_contact_mobile: Joi.string().pattern(/^[0-9]{10}$/).optional().allow(null, ''),
    current_status: Joi.string().valid('available', 'on_trip', 'off_duty', 'inactive').optional(),
    joining_date: Joi.date().iso().optional().allow(null),
    aadhar_number: Joi.string().pattern(/^[0-9]{12}$/).optional().allow(null, ''),
    bank_account_number: Joi.string().max(50).optional().allow(null, ''),
    bank_ifsc_code: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).optional().allow(null, ''),
    notes: Joi.string().max(1000).optional().allow(null, ''),
  }).min(1),
};

// =====================================================================
// Vehicle Validation Schemas
// =====================================================================

export const vehicleSchemas = {
  create: Joi.object({
    registration_number: Joi.string().required().min(5).max(20).trim().uppercase(),
    make: Joi.string().required().min(2).max(50).trim(),
    model: Joi.string().required().min(2).max(50).trim(),
    year: Joi.number().integer().min(1950).max(new Date().getFullYear() + 1).optional().allow(null),
    color: Joi.string().max(30).optional().allow(null, ''),
    category_id: Joi.number().integer().positive().required(),
    seating_capacity: Joi.number().integer().min(1).max(100).optional().allow(null),
    fuel_type: Joi.string().valid('petrol', 'diesel', 'cng', 'electric', 'hybrid').optional().allow(null),
    insurance_expiry_date: Joi.date().iso().optional().allow(null),
    fitness_certificate_expiry: Joi.date().iso().optional().allow(null),
    permit_expiry_date: Joi.date().iso().optional().allow(null),
    pollution_certificate_expiry: Joi.date().iso().optional().allow(null),
    owner_name: Joi.string().max(100).optional().allow(null, ''),
    owner_mobile: Joi.string().pattern(/^[0-9]{10}$/).optional().allow(null, ''),
    purchase_date: Joi.date().iso().optional().allow(null),
    chassis_number: Joi.string().max(50).optional().allow(null, ''),
    engine_number: Joi.string().max(50).optional().allow(null, ''),
    notes: Joi.string().max(1000).optional().allow(null, ''),
  }),

  update: Joi.object({
    registration_number: Joi.string().min(5).max(20).trim().uppercase().optional(),
    make: Joi.string().min(2).max(50).trim().optional(),
    model: Joi.string().min(2).max(50).trim().optional(),
    year: Joi.number().integer().min(1950).max(new Date().getFullYear() + 1).optional().allow(null),
    color: Joi.string().max(30).optional().allow(null, ''),
    category_id: Joi.number().integer().positive().optional(),
    seating_capacity: Joi.number().integer().min(1).max(100).optional().allow(null),
    fuel_type: Joi.string().valid('petrol', 'diesel', 'cng', 'electric', 'hybrid').optional().allow(null),
    insurance_expiry_date: Joi.date().iso().optional().allow(null),
    fitness_certificate_expiry: Joi.date().iso().optional().allow(null),
    permit_expiry_date: Joi.date().iso().optional().allow(null),
    pollution_certificate_expiry: Joi.date().iso().optional().allow(null),
    current_status: Joi.string().valid('available', 'on_trip', 'maintenance', 'inactive').optional(),
    current_driver_id: Joi.number().integer().positive().optional().allow(null),
    owner_name: Joi.string().max(100).optional().allow(null, ''),
    owner_mobile: Joi.string().pattern(/^[0-9]{10}$/).optional().allow(null, ''),
    purchase_date: Joi.date().iso().optional().allow(null),
    chassis_number: Joi.string().max(50).optional().allow(null, ''),
    engine_number: Joi.string().max(50).optional().allow(null, ''),
    notes: Joi.string().max(1000).optional().allow(null, ''),
  }).min(1),
};

// =====================================================================
// Trip Validation Schemas
// =====================================================================

export const tripSchemas = {
  create: Joi.object({
    booking_id: Joi.number().integer().positive().required(),
    driver_id: Joi.number().integer().positive().required(),
    vehicle_id: Joi.number().integer().positive().required(),
  }),

  update: Joi.object({
    status: Joi.string().valid('assigned', 'started', 'in_progress', 'completed', 'cancelled').optional(),
    started_at: Joi.date().iso().optional().allow(null),
    completed_at: Joi.date().iso().optional().allow(null),
    cancelled_at: Joi.date().iso().optional().allow(null),
    start_km_reading: Joi.number().min(0).optional().allow(null),
    end_km_reading: Joi.number().min(0).optional().allow(null),
    total_km: Joi.number().min(0).optional().allow(null),
    start_location: Joi.string().max(500).optional().allow(null, ''),
    end_location: Joi.string().max(500).optional().allow(null, ''),
    driver_notes: Joi.string().max(1000).optional().allow(null, ''),
    cancellation_reason: Joi.string().max(500).optional().allow(null, ''),
  }).min(1),
};
