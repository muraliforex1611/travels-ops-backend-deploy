// =====================================================================
// App Module - Main Application Module
// =====================================================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DriversModule } from './modules/drivers/drivers.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { CustomersModule } from './modules/customers/customers.module';
import { TripsModule } from './modules/trips/trips.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { AllocationModule } from './modules/allocation/allocation.module';
import { EmailIntegrationModule } from './modules/email-integration/email-integration.module';
import { WhatsappIntegrationModule } from './modules/whatsapp-integration/whatsapp-integration.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Environment Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting (10 requests per minute)
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds
      limit: 10, // 10 requests per minute
    }]),

    // Feature Modules
    AuthModule,
    UsersModule,
    CompaniesModule,
    WhatsappIntegrationModule,
    EmailIntegrationModule,
    AccountsModule,
    AllocationModule,
    DriversModule,
    VehiclesModule,
    BookingsModule,
    CustomersModule,
    TripsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
