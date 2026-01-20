# Backend API Service

A robust Express.js backend service with TypeScript, TypeORM, and PostgreSQL, providing secure user authentication and role-based access control.

## 🌟 Features

### Core Features
- TypeScript-based Express.js API
- PostgreSQL database with TypeORM
- JWT authentication and authorization
- Role-based access control (Admin/User)
- API documentation with Swagger
- Database migrations and seeding
- Secure password hashing with bcrypt

### API Endpoints

#### Authentication
- `POST /api/users/login` - User authentication
- `POST /api/users` - User registration

#### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - List all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### System
- `GET /api/health` - System health check

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- PostgreSQL database
- npm 7.x or later

### Environment Setup
Create a `.env` file in the backend root:
```bash
PORT=3001
POSTGRES_USER=your_db_user
POSTGRES_HOST=localhost
POSTGRES_PASSWORD=your_db_password
POSTGRES_DATABASE=your_db_name
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

### Installation
```bash
# Install dependencies
npm install

# Initialize database and run migrations
npm run db:migrate

# Seed the database with initial data
npm run db:seed
```

This will create a default admin user:
- Email: admin@example.com
- Password: admin123

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📚 API Documentation

Swagger documentation is available at `/api-docs` when the server is running. It provides:
- Detailed endpoint documentation
- Request/response schemas
- Authentication requirements
- Testing interface

## 🔒 Security Features

### Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- Token expiration and refresh
- Protected routes middleware

### Authorization
- Role-based access control
- Admin-only routes
- User permission validation

### Security Measures
- CORS configuration
- Rate limiting
- Input validation
- SQL injection protection
- XSS protection

## 📁 Project Structure
```
backend/
├── db/                 # Database configuration
│   ├── entities/       # TypeORM entities
│   ├── migrations/     # Database migrations
│   └── seed.ts        # Database seeding
├── routes/            # API routes
├── services/          # Business logic
├── middleware/        # Custom middleware
├── types/             # TypeScript types
├── utils/             # Utility functions
└── config/            # Configuration files
```

## 🧪 Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run format` - Format code

## 🔧 Configuration

### Database Configuration
Database configuration is managed through TypeORM in `db/data-source.ts`:
- Connection pooling
- SSL configuration for production
- Migration settings
- Entity registration

### JWT Configuration
JWT settings in environment variables:
- Token secret
- Token expiration
- Token refresh settings

### CORS Configuration
CORS settings in `index.ts`:
- Allowed origins
- Allowed methods
- Allowed headers

## 🌐 Deployment

### Production Deployment
1. Set up environment variables
2. Build the application
3. Run database migrations
4. Start the server

### Vercel Deployment
The backend is optimized for Vercel deployment:
1. Configure build settings
2. Set up environment variables
3. Connect to PostgreSQL database
4. Deploy serverless functions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License. 