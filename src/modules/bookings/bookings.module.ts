// =====================================================================
// Bookings Module
// =====================================================================

import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService], // Export to use in other modules
})
export class BookingsModule {}

// =====================================================================
// WHAT THIS MODULE DOES:
// =====================================================================
// 1. Registers BookingsController (API endpoints)
// 2. Registers BookingsService (Database logic)
// 3. Exports BookingsService (for use in other modules like trips)
//
// This is the core booking management module
// =====================================================================
