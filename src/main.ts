// =====================================================================
// Main Application Entry Point
// =====================================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import * as dotenv from 'dotenv';
import helmet from 'helmet';
import * as compression from 'compression';

dotenv.config();

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers with Helmet
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
  }));

  // Response compression
  app.use(compression());

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // CORS Configuration
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Travel Operations Platform API')
    .setDescription('Backend API for Travel Operations Management System')
    .setVersion('1.0')
    .addTag('Authentication')
    .addTag('Drivers')
    .addTag('Vehicles')
    .addTag('Bookings')
    .addTag('Customers')
    .addTag('Trips')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  logger.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║   🚀 Travel Operations Platform API                       ║
    ║   📡 Server running on: http://localhost:${port}           ║
    ║   📚 API Documentation: http://localhost:${port}/api/docs  ║
    ║   🔒 Security: Helmet + Compression enabled               ║
    ║   ✅ Environment: ${process.env.NODE_ENV || 'development'}║
    ╚═══════════════════════════════════════════════════════════╝
  `);
  logger.log(`Application is running on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  logger.error('Failed to start application', err);
  process.exit(1);
});
