# Full-Stack Monorepo Application

A comprehensive full-stack application monorepo featuring a Next.js frontend and Express.js backend, demonstrating modern web development practices with TypeScript, user authentication, and role-based access control.

## 🎯 Overview

This monorepo contains two main applications:

### [Frontend Application](apps/frontend/README.md)
A modern Next.js 13+ web application with:
- Beautiful, responsive UI with Tailwind CSS
- User authentication and profile management
- Role-based access control
- Interactive components and forms
- TypeScript for type safety

### [Backend API](apps/backend/README.md)
A robust Express.js API service with:
- TypeScript and TypeORM
- PostgreSQL database
- JWT authentication
- Role-based authorization
- Swagger API documentation

## 🏗️ Architecture

```
monorepo/
├── apps/
│   ├── frontend/          # Next.js web application
│   │   ├── app/          # Pages and components
│   │   ├── components/   # Reusable UI components
│   │   └── public/       # Static assets
│   └── backend/          # Express.js API
│       ├── db/           # Database and entities
│       ├── routes/       # API endpoints
│       └── services/     # Business logic
└── package.json          # Root package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or later
- npm 7.x or later
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Frontend (.env.local):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Backend (.env):
```bash
PORT=3001
POSTGRES_USER=your_db_user
POSTGRES_HOST=localhost
POSTGRES_PASSWORD=your_db_password
POSTGRES_DATABASE=your_db_name
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

4. Initialize the database:
```bash
cd apps/backend
npm run db:migrate
npm run db:seed
```

5. Start the applications:
```bash
# In one terminal (frontend)
npm run dev -w frontend

# In another terminal (backend)
npm run dev -w backend
```

The applications will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Documentation: http://localhost:3001/api-docs

## 🔑 Default Admin User
After seeding the database, you can log in with:
- Email: admin@example.com
- Password: admin123

## 🛠️ Development

### Available Scripts

Root level:
```bash
npm run dev        # Start all applications in development mode
npm run build      # Build all applications
npm run lint       # Lint all applications
npm run test       # Run all tests
```

Individual applications:
```bash
npm run dev -w frontend    # Start frontend in development mode
npm run dev -w backend     # Start backend in development mode
npm run build -w frontend  # Build frontend
npm run build -w backend   # Build backend
```

## 📚 Documentation

- [Frontend Documentation](apps/frontend/README.md)
- [Backend Documentation](apps/backend/README.md)
- API Documentation (available at `/api-docs` when backend is running)

## 🔒 Security Features

- JWT authentication
- Role-based access control
- Secure password hashing
- Protected API endpoints
- Input validation
- CORS configuration
- XSS protection
- SQL injection protection

## 🌐 Deployment

The application is optimized for deployment on Vercel:

### Frontend Deployment
1. Connect to Vercel
2. Configure build settings
3. Set environment variables
4. Deploy

### Backend Deployment
1. Configure Vercel for backend
2. Set up PostgreSQL database
3. Configure environment variables
4. Deploy serverless functions

### Database
1. Set up PostgreSQL database
2. Run migrations
3. Configure connection

## 🧪 Testing

Each application includes its own test suite:

```bash
# Run frontend tests
npm test -w frontend

# Run backend tests
npm test -w backend

# Run all tests
npm test
```

## 📈 Monitoring

- Frontend performance monitoring
- Backend health checks
- Database connection monitoring
- Error tracking
- User analytics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Run tests
5. Create a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Express.js community
- TypeORM contributors
- Tailwind CSS team 