# 🚀 Travel Operations Platform - Backend API

> A **modern, scalable, and future-proof** Travel Operations Management System built with NestJS and Supabase.

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## 🎯 Vision

Build a **unique** travel operations platform that won't need major updates for **5 years**, with:
- 🚀 Scalability to 100,000+ users
- ⚡ <500ms API response time
- 📱 Mobile-first approach
- 🌍 Multi-tenant ready
- 🎨 White-label ready

---

## 📁 Project Structure

```
E:\Projects\travel-ops-backend\
├── src/
│   ├── config/
│   │   └── database.config.ts          # Supabase configuration
│   ├── modules/
│   │   ├── drivers/                     # Drivers module
│   │   │   ├── drivers.service.ts
│   │   │   ├── drivers.controller.ts
│   │   │   └── drivers.module.ts
│   │   └── vehicles/                    # Vehicles module
│   │       ├── vehicles.service.ts
│   │       ├── vehicles.controller.ts
│   │       └── vehicles.module.ts
│   ├── app.module.ts                    # Main application module
│   └── main.ts                          # Application entry point
├── .env                                 # Environment variables
├── package.json                         # Dependencies
├── tsconfig.json                        # TypeScript configuration
├── README.md                            # This file
├── ROADMAP.md                           # 5-year development plan
└── IMMEDIATE_TASKS.md                   # Next 2 weeks tasks
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the root directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### 3. Run the Development Server

```bash
npm run start:dev
```

The server will start on `http://localhost:3001`

## 📚 API Documentation

Swagger documentation is available at:
```
http://localhost:3001/api/docs
```

## 🛣️ API Endpoints

### Drivers
- `GET /api/v1/drivers` - Get all drivers
- `GET /api/v1/drivers/available` - Get available drivers
- `GET /api/v1/drivers/:id` - Get driver by ID
- `POST /api/v1/drivers` - Create new driver
- `PUT /api/v1/drivers/:id` - Update driver
- `PUT /api/v1/drivers/:id/status` - Update driver status
- `DELETE /api/v1/drivers/:id` - Deactivate driver

### Vehicles
- `GET /api/v1/vehicles` - Get all vehicles
- `GET /api/v1/vehicles/available` - Get available vehicles
- `GET /api/v1/vehicles/:id` - Get vehicle by ID
- `POST /api/v1/vehicles` - Create new vehicle
- `PUT /api/v1/vehicles/:id` - Update vehicle
- `PUT /api/v1/vehicles/:id/status` - Update vehicle status
- `PUT /api/v1/vehicles/:id/mileage` - Update vehicle mileage
- `DELETE /api/v1/vehicles/:id` - Deactivate vehicle

## 🛠️ Tech Stack

- **Framework**: NestJS 10+ (Future-proof, enterprise-grade)
- **Database**: PostgreSQL via Supabase (Scalable, real-time)
- **Language**: TypeScript 5+ (Type-safe, modern)
- **Documentation**: Swagger/OpenAPI (Interactive API docs)
- **Validation**: class-validator, class-transformer
- **Authentication**: JWT + Supabase Auth (Coming soon)
- **Real-time**: Supabase Realtime (Coming soon)

## 📦 Available Scripts

- `npm run start` - Start production server
- `npm run start:dev` - Start development server with watch mode
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Lint code

## 🔧 Development

This project follows NestJS modular architecture. Each feature is organized as a module with:
- **Service**: Business logic and database operations
- **Controller**: API endpoints and request handling
- **Module**: Feature registration and dependency injection

---

## 📚 Documentation

- **[5-Year Roadmap](./ROADMAP.md)** - Complete development plan
- **[Immediate Tasks](./IMMEDIATE_TASKS.md)** - Next 2 weeks plan
- **[API Documentation](http://localhost:3000/api/docs)** - Swagger UI

---

## 🎯 Upcoming Features

### Week 3-4:
- [ ] Bookings Module
- [ ] Customers Module
- [ ] Authentication & Authorization
- [ ] DTOs & Validation

### Week 5-8:
- [ ] Trips Module
- [ ] Routes Module
- [ ] Notifications Module
- [ ] Reports & Analytics

---

## 🤝 Contributing

This is a private project. For any questions or suggestions, please contact the development team.

---

## 📝 License

MIT License - Copyright (c) 2025

---

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Powered by [Supabase](https://supabase.com/)
- Designed for scalability and performance

---

## 📞 Support

For support or questions:
- Check the [ROADMAP.md](./ROADMAP.md) for feature plans
- Check [IMMEDIATE_TASKS.md](./IMMEDIATE_TASKS.md) for current tasks
- Review API docs at http://localhost:3000/api/docs

---

**Made with ❤️ using Claude Code & NestJS**

*Last Updated: December 21, 2025*
