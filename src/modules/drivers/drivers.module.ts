// =====================================================================
// WEEK 2 - DAY 12: Drivers Module
// =====================================================================
// File Location: src/modules/drivers/drivers.module.ts
// Purpose: Register drivers service and controller
// Instructions: Copy this entire file and paste in VS Code
// =====================================================================

import { Module } from '@nestjs/common';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';

@Module({
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService], // Export to use in other modules (like trips)
})
export class DriversModule {}

// =====================================================================
// WHAT THIS MODULE DOES:
// =====================================================================
// 1. Registers DriversController (API endpoints)
// 2. Registers DriversService (Database logic)
// 3. Exports DriversService (for use in other modules)
//
// This is like a "package" that bundles everything related to drivers
// =====================================================================

// =====================================================================
// HOW TO USE THIS MODULE:
// =====================================================================
// 1. Copy this entire file
// 2. Create file: src/modules/drivers/drivers.module.ts
// 3. Paste this code
// 4. Save (Ctrl+S)
// 5. Continue to Day 13 (Add to app.module.ts)
// =====================================================================
