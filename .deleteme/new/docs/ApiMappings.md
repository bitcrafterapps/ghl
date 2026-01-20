# API to Frontend Component Mappings

## Authentication & Profile Components

### Login Page (`app/login/page.tsx`)
- POST `/api/users/login` - User authentication
- Dependencies: Authentication flow

### Profile Page (`app/profile/page.tsx`)
- GET `/api/users/profile` - Fetch user profile
- POST `/api/users/change-password` - Change password
- PUT `/api/users/:id/preferences` - Update preferences
- Dependencies: User profile, theme settings

### Layout Component (`components/Layout.tsx`)
- GET `/api/users/profile` - Authentication check
- Dependencies: Global authentication state

## User Management Components

### Users Page (`app/users/page.tsx`)
- GET `/api/users/profile` - Admin check
- GET `/api/users` - List all users
- GET `/api/users/:id` - Get specific user
- PUT `/api/users/:id` - Update user
- POST `/api/users` - Create user
- Dependencies: User management, admin functions

### Pending Users Page (`app/pending-users/page.tsx`)
- GET `/api/users/profile` - Admin check
- GET `/api/users/pending` - List pending users
- PUT `/api/users/:id/approve` - Approve user
- PUT `/api/users/:id/reject` - Reject user
- Dependencies: User approval workflow

## Company Management Components

### Companies Page (`app/companies/page.tsx`)
- GET `/api/users/profile` - Auth/admin check
- GET `/api/companies` - List all companies
- GET `/api/companies/:id` - Get specific company
- PUT `/api/companies/:id` - Update company
- Dependencies: Company management

### Company Detail Page (`app/companies/[id]/page.tsx`)
- GET `/api/users/profile` - Auth check
- GET `/api/companies/:id` - Company details
- POST `/api/companies` - Create company
- PUT `/api/companies/:id` - Update company
- DELETE `/api/companies/:id/users/:userId` - Remove user from company
- Dependencies: Company details, user management

## Dashboard Components

### Dashboard Page (`app/dashboard/page.tsx`)
- GET `/api/users/profile` - Auth check
- GET `/api/dashboard/stats` - Dashboard statistics
- GET `/api/dashboard/recent-changes` - Activity feed
- Dependencies: Statistics, activity tracking

### Header Component (`components/Header.tsx`)
- GET `/api/dashboard/recent-changes` - Recent activity
- Dependencies: Activity notifications

## V1 API Implementation Plan

### Phase 1: Backend Authentication & User API (No Frontend Changes)

#### New V1 Endpoints to Implement:
1. **Authentication**
   - POST `/api/v1/auth/login` - User authentication
   
2. **User Management**
   - GET `/api/v1/users/profile` - Get user profile
   - GET `/api/v1/users` - List all users
   - POST `/api/v1/users` - Create user
   - GET `/api/v1/users/:id` - Get user by ID
   - PUT `/api/v1/users/:id` - Update user
   - DELETE `/api/v1/users/:id` - Delete user
   - GET `/api/v1/users/pending` - List pending users
   - PUT `/api/v1/users/:id/approve` - Approve user
   - PUT `/api/v1/users/:id/reject` - Reject user
   - PUT `/api/v1/users/:id/preferences` - Update preferences
   - POST `/api/v1/users/change-password` - Change password

#### Implementation Details:
- All v1 endpoints will return standardized response format
- Authentication middleware will work for both legacy and v1 APIs
- Both API versions will exist simultaneously
- No frontend changes will be made during Phase 1

#### Testing Requirements:
- Each endpoint must have unit tests
- Integration tests must verify all functionality
- Response formats must follow the new standard
- Authentication must be properly enforced

## Frontend Migration Strategy (Future Phases)

After all v1 backend APIs are implemented and tested, frontend components will be migrated in the following order:

### Phase 4: Authentication & Profile Components
- Login Page
- Profile Page
- Layout Component

### Phase 5: User Management Components
- Users Page
- Pending Users Page

### Phase 6: Company Management Components
- Companies Page
- Company Detail Page

### Phase 7: Dashboard Components
- Dashboard Page
- Header Component

## Component-specific Dependencies

### Critical Components
1. Layout & Authentication
   - Layout.tsx
   - Login page
   - Profile management
   
2. Core Features
   - User management
   - Company management
   - Dashboard
   
3. Supporting Features
   - Activity logging
   - User preferences
   - Health checks

## Migration Impact Analysis

### High Impact Areas
1. Authentication Flow
   - Multiple components depend on `/api/users/profile`
   - Critical for app security
   
2. User Management
   - Complex approval workflow
   - Multiple dependent components

3. Company Management
   - Integrated with user management
   - Critical for multi-tenant features

### Low Impact Areas
1. Activity Logging
   - Mostly independent
   - Can be migrated separately

2. Dashboard Statistics
   - Non-critical functionality
   - Can be updated gradually

## Compatibility Requirements During Migration

1. **Authentication Compatibility**
   - Both API versions must accept the same JWT token format
   - User data structure must be consistent
   - Role-based access control must function identically

2. **Data Consistency**
   - Response data structures must be compatible across API versions
   - Error handling must be consistent or easily adaptable
   - Pagination and filtering parameters should be maintained

3. **Performance Expectations**
   - V1 API response times should match or exceed legacy API
   - Error rates should be monitored during parallel operation
   - Resource utilization should be tracked and compared

## Validation Strategy

Before frontend migration begins:
1. Complete comprehensive testing of all v1 backend endpoints
2. Verify compatibility with existing authentication
3. Document all differences between legacy and v1 responses
4. Create test harness for frontend components to verify v1 compatibility 