// =====================================================================
// WEEK 2 - DAY 12: Vehicles Module
// =====================================================================
// File Location: src/modules/vehicles/vehicles.module.ts
// Purpose: Register vehicles service and controller
// Instructions: Copy this entire file and paste in VS Code
// =====================================================================

import { Module } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';

@Module({
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService], // Export to use in other modules (like trips)
})
export class VehiclesModule {}

// =====================================================================
// WHAT THIS MODULE DOES:
// =====================================================================
// 1. Registers VehiclesController (API endpoints)
// 2. Registers VehiclesService (Database logic)
// 3. Exports VehiclesService (for use in other modules)
//
// This is like a "package" that bundles everything related to vehicles
// =====================================================================

// =====================================================================
// HOW TO USE THIS MODULE:
// =====================================================================
// 1. Copy this entire file
// 2. Create file: src/modules/vehicles/vehicles.module.ts
// 3. Paste this code
// 4. Save (Ctrl+S)
// 5. Continue to Day 13 (Add to app.module.ts)
// =====================================================================
