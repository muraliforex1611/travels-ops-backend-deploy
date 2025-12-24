// =====================================================================
// Companies Module
// =====================================================================

import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService], // Export for use in other modules
})
export class CompaniesModule {}
