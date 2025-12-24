import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailIntegrationController } from './email-integration.controller';
import { EmailIntegrationService } from './email-integration.service';
import { EmailPollingService } from './email-polling.service';
import { AllocationModule } from '../allocation/allocation.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Enable cron scheduling
    AllocationModule, // For auto-allocation after booking creation
  ],
  controllers: [EmailIntegrationController],
  providers: [EmailIntegrationService, EmailPollingService],
  exports: [EmailIntegrationService, EmailPollingService],
})
export class EmailIntegrationModule {}
