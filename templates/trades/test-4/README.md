# Frontend Web Application

A modern, responsive web application built with Next.js 13+, featuring user authentication, profile management, and a beautiful UI powered by Tailwind CSS.

## 🌟 Features

### User Interface
- Modern, responsive design
- Interactive user profile management
- Role-based access control
- Beautiful UI components
- Smooth transitions and animations
- Loading states and error handling
- Form validation
- Success/error notifications

### Pages & Components
- **Authentication**
  - Login page with validation
  - Registration page
  - Password recovery
- **Dashboard**
  - User overview
  - System status
  - Role-specific features
- **Profile Management**
  - Personal information updates
  - Password changes
  - Role display
  - Avatar with user initials
- **Navigation**
  - Responsive header
  - User profile dropdown
  - Role-based menu items

### Technical Features
- Next.js 13+ with App Router
- TypeScript for type safety
- TailwindCSS for styling
- JWT authentication
- Protected routes
- API integration
- Form validation
- Error handling
- Loading states

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- npm 7.x or later

### Environment Setup
Create a `.env.local` file in the frontend root:
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure
```
frontend/
├── app/                # App router pages
│   ├── login/         # Authentication
│   ├── dashboard/     # User dashboard
│   ├── profile/       # Profile management
│   └── layout.tsx     # Root layout
├── components/        # Reusable components
│   ├── Header.tsx    # Navigation header
│   ├── Footer.tsx    # Page footer
│   └── ui/           # UI components
├── lib/              # Utilities and helpers
├── styles/           # Global styles
└── public/           # Static assets
```

## 🎨 UI Components

### Header
- Responsive navigation
- User profile dropdown
- Dynamic menu based on auth state
- Role display

### Profile Management
- Personal information form
- Password change form
- Role badges
- Avatar with initials

### Forms
- Input validation
- Error messages
- Loading states
- Success notifications

### Dashboard
- System status display
- User-specific content
- Role-based features

## 🔒 Security Features

### Authentication
- JWT token management
- Protected routes
- Session handling
- Automatic token refresh

### Authorization
- Role-based access control
- Protected components
- Secure API calls

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile devices
- Different screen sizes and orientations

## 🎯 State Management

- Local state with React hooks
- Form state management
- Authentication state
- Loading states
- Error handling

## 🔧 Configuration

### API Integration
- Axios for API calls
- Error handling
- Request/response interceptors
- Authentication headers

### Styling
- TailwindCSS configuration
- Custom theme settings
- Responsive breakpoints
- Dark mode support

## 🌐 Deployment

### Vercel Deployment
1. Connect to GitHub repository
2. Configure environment variables
3. Set up build settings
4. Deploy application

### Production Optimization
- Code splitting
- Image optimization
- Static generation
- Caching strategies

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run format` - Format code

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.
