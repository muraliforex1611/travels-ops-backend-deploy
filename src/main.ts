// =====================================================================
// Main Application Entry Point
// =====================================================================

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  console.log(`
    ╔═══════════════════════════════════════════════════════════╗
    ║   🚀 Travel Operations Platform API                       ║
    ║   📡 Server running on: http://localhost:${port}           ║
    ║   📚 API Documentation: http://localhost:${port}/api/docs  ║
    ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
