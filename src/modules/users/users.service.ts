// =====================================================================
// Users Service - User Management Business Logic
// =====================================================================

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

@Injectable()
export class UsersService {
  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Find user by ID
   */
  async findById(userId: number) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, email, full_name, phone_number, role, is_active, is_email_verified, last_login_at, created_at')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      return data;
    } catch (error) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  /**
   * Create new user
   */
  async create(userData: {
    email: string;
    password: string;
    full_name: string;
    phone_number?: string;
    role?: string;
  }) {
    try {
      // Check if user already exists
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(userData.password, saltRounds);

      // Prepare user data
      const newUser = {
        email: userData.email.toLowerCase(),
        password_hash,
        full_name: userData.full_name,
        phone_number: userData.phone_number || null,
        role: userData.role || 'customer',
        is_active: true,
        is_email_verified: false,
      };

      // Insert into database
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select('user_id, email, full_name, phone_number, role, is_active, created_at')
        .single();

      if (error) {
        throw new ConflictException('Failed to create user: ' + error.message);
      }

      return data;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Failed to create user');
    }
  }

  /**
   * Update last login time
   */
  async updateLastLogin(userId: number) {
    try {
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (error) {
      // Silent fail - not critical
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    try {
      // Get user with password hash
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !user) {
        throw new NotFoundException('User not found');
      }

      // Verify old password
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isPasswordValid) {
        throw new ConflictException('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: newPasswordHash })
        .eq('user_id', userId);

      if (updateError) {
        throw new ConflictException('Failed to update password');
      }

      return { message: 'Password changed successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Failed to change password');
    }
  }

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string) {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return null;
      }

      // Don't return password hash
      const { password_hash, ...result } = user;
      return result;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get all users (admin only)
   */
  async findAll() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, email, full_name, phone_number, role, is_active, is_email_verified, last_login_at, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        throw new NotFoundException('Failed to fetch users');
      }

      return data;
    } catch (error) {
      throw new NotFoundException('Failed to fetch users');
    }
  }
}
