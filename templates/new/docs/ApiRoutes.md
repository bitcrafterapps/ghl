# API Routes Documentation

## Current Endpoint Map

### User Management Routes (`/routes/user`)
- POST `/login` - User authentication
- GET `/profile` - Get user profile *(duplicate with /api/users/profile)*
- GET `/pending` - Get pending users
- PUT `/profile` - Update user profile
- POST `/` - Create new user
- GET `/` - Get all users
- GET `/:id` - Get user by ID
- PUT `/:id` - Update user by ID
- DELETE `/:id` - Delete user
- POST `/change-password` - Change user password
- PUT `/:id/preferences` - Update user preferences
- PUT `/:id/reject` - Reject pending user
- PUT `/:id/approve` - Approve pending user

### Health Routes (`/routes/health`)
- GET `/ping` - Health check ping
- GET `/` - Detailed health check

### Company Routes (`/api/companies`)
- GET `/` - Get all companies
- GET `/:id` - Get company by ID
- POST `/` - Create new company
- PUT `/:id` - Update company
- DELETE `/:id` - Delete company
- POST `/:id/users` - Add user to company
- DELETE `/:id/users/:userId` - Remove user from company

### Dashboard Routes (`/api/dashboard`)
- GET `/stats` - Get dashboard statistics
- GET `/recent-changes` - Get recent changes

### Activity Routes (`/api/activity`)
- POST `/log` - Log activity

### User API Routes (`/api/users`)
- GET `/profile` - Get user profile *(duplicate with /routes/user/profile)*

## V1 API Structure (Phase 1 Implementation)

### Authentication Routes (`/api/v1/auth`)
- POST `/login` - User authentication
- POST `/register` - User registration (future)
- POST `/forgot` - Forgot password (future)
- POST `/reset` - Reset password (future)
- GET `/verify` - Verify email (future)

### User Routes (`/api/v1/users`)
- GET `/profile` - Get current user profile
- GET `/` - List all users
- POST `/` - Create new user
- GET `/:id` - Get user by ID
- PUT `/:id` - Update user
- DELETE `/:id` - Delete user
- GET `/pending` - List pending users
- PUT `/:id/approve` - Approve user
- PUT `/:id/reject` - Reject user
- PUT `/:id/preferences` - Update user preferences
- POST `/change-password` - Change password

## Duplicate Endpoints

1. User Profile Endpoint
   - `/routes/user/profile` (GET) - Legacy
   - `/api/users/profile` (GET) - Legacy
   - `/api/v1/users/profile` (GET) - New v1 endpoint
   
2. User Authentication
   - `/routes/user/login` (POST) - Legacy
   - `/api/v1/auth/login` (POST) - New v1 endpoint

## Migration Strategy

### Phase 1: Backend Implementation Only

1. **Implementation Approach**
   - Implement all v1 endpoints in parallel with existing endpoints
   - Both legacy and v1 endpoints will be active simultaneously
   - No frontend changes during Phase 1

2. **Authentication Compatibility**
   - Auth middleware must support both API versions
   - JWT tokens should be compatible across all endpoints
   - Public routes configuration must include both legacy and v1 paths

3. **Validation Strategy**
   - Each v1 endpoint must be thoroughly tested before proceeding
   - Integration tests must verify backward compatibility
   - Response formats must follow the new standard

## Backend-Frontend Separation Plan

### Backend Changes (Phase 1)
- Implement all v1 authentication endpoints
- Implement all v1 user management endpoints
- Configure auth middleware for both API versions
- Standard response format across all new endpoints
- Comprehensive testing and validation

### Frontend Changes (Future Phases)
- No frontend changes during Phase 1
- Continue using existing API endpoints
- Migrate frontend components gradually in later phases
- Validate each component with v1 endpoints before switching

## Testing Requirements

### For Each New v1 Endpoint
- Unit tests for request validation
- Unit tests for response format
- Integration tests for authentication
- Integration tests for business logic
- Performance comparison with legacy endpoint

## Monitoring Strategy

During parallel operation of legacy and v1 endpoints:

1. **Performance Monitoring**
   - Response time comparisons
   - Error rate tracking
   - Resource utilization

2. **Usage Tracking**
   - Log which endpoints are being used
   - Monitor JWT token versions
   - Track API version preferences

## Future Tasks (After Phase 1)

- Company management endpoints
- Dashboard endpoints
- Activity logging
- Health checks
- Frontend component migration

## Frontend Component Dependencies

Frontend components need to be analyzed for API dependencies. Key areas to check:

1. Authentication flows
   - Login component
   - Profile management
   - Password change

2. Company Management
   - Company listing
   - Company details
   - User-company relationships

3. Dashboard Components
   - Statistics display
   - Recent activity
   - User management

4. Activity Logging
   - Action tracking
   - Event logging

Note: A detailed component-by-component analysis should be performed before beginning the migration to ensure no endpoints are missed or broken during the process.

## Migration Notes

### Current Pattern Issues
1. Mixed routing patterns between `/routes` and `/api`
2. Duplicate implementations for user profile
3. Inconsistent authentication middleware usage
4. Different response formats across endpoints

### Standardization Recommendations
1. Move all endpoints under `/api/v1/`
2. Standardize response format
3. Consistent authentication middleware
4. Remove duplicate implementations

### Priority Migration Order
1. Resolve duplicate endpoints
2. Standardize authentication
3. Migrate user management routes
4. Migrate supporting features 