"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSwaggerConfig = void 0;
const createSwaggerConfig = (port) => ({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Three Bears Platform - API Documentation',
            version: '1.0.0',
            description: 'API documentation for the Three Bears Platform'
        },
        servers: [
            {
                url: process.env.NODE_ENV === 'production'
                    ? 'https://hello-vercel-be.vercel.app/'
                    : `http://localhost:${port}`,
                description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                StandardResponse: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'object',
                            description: 'The response data'
                        },
                        error: {
                            type: 'object',
                            properties: {
                                code: {
                                    type: 'string',
                                    description: 'Error code'
                                },
                                message: {
                                    type: 'string',
                                    description: 'Error message'
                                },
                                details: {
                                    type: 'object',
                                    description: 'Additional error details'
                                }
                            }
                        },
                        meta: {
                            type: 'object',
                            properties: {
                                pagination: {
                                    type: 'object',
                                    properties: {
                                        page: {
                                            type: 'integer',
                                            description: 'Current page number'
                                        },
                                        limit: {
                                            type: 'integer',
                                            description: 'Items per page'
                                        },
                                        total: {
                                            type: 'integer',
                                            description: 'Total number of items'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                UserRole: {
                    type: 'string',
                    enum: ['Site Admin', 'Admin', 'User']
                },
                ThemeType: {
                    type: 'string',
                    enum: ['light', 'dark', 'system']
                },
                UserPreferencesDto: {
                    type: 'object',
                    properties: {
                        emailNotify: {
                            type: 'boolean',
                            description: 'Whether to receive email notifications'
                        },
                        smsNotify: {
                            type: 'boolean',
                            description: 'Whether to receive SMS notifications'
                        },
                        phoneNumber: {
                            type: 'string',
                            description: 'Phone number for SMS notifications',
                            pattern: '^\+?[1-9]\d{1,14}$'
                        },
                        theme: {
                            $ref: '#/components/schemas/ThemeType'
                        }
                    }
                },
                UserDto: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', format: 'email' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        password: { type: 'string', format: 'password' },
                        roles: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/UserRole' }
                        },
                        emailNotify: { type: 'boolean' },
                        smsNotify: { type: 'boolean' },
                        phoneNumber: { type: 'string', pattern: '^\+?[1-9]\d{1,14}$' },
                        theme: { $ref: '#/components/schemas/ThemeType' }
                    },
                    required: ['email']
                },
                UserResponse: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        email: { type: 'string', format: 'email' },
                        firstName: { type: 'string' },
                        lastName: { type: 'string' },
                        roles: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/UserRole' }
                        },
                        emailNotify: { type: 'boolean' },
                        smsNotify: { type: 'boolean' },
                        phoneNumber: { type: 'string' },
                        theme: { $ref: '#/components/schemas/ThemeType' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                LoginDto: {
                    type: 'object',
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', format: 'password' }
                    },
                    required: ['email', 'password']
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        token: { type: 'string' },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'integer' },
                                email: { type: 'string', format: 'email' },
                                firstName: { type: 'string' },
                                lastName: { type: 'string' },
                                roles: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/UserRole' }
                                }
                            }
                        }
                    }
                },
                ChangePasswordDto: {
                    type: 'object',
                    required: ['currentPassword', 'newPassword'],
                    properties: {
                        currentPassword: {
                            type: 'string',
                            format: 'password',
                            description: 'Current password of the user'
                        },
                        newPassword: {
                            type: 'string',
                            format: 'password',
                            description: 'New password to set (minimum 8 characters)'
                        }
                    }
                },
                CompanyDto: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        addressLine1: { type: 'string' },
                        city: { type: 'string' },
                        state: { type: 'string', minLength: 2, maxLength: 2 },
                        zip: { type: 'string', pattern: '^\d{5}$' },
                        email: { type: 'string', format: 'email' },
                        phone: { type: 'string' }
                    },
                    required: ['name', 'addressLine1', 'city', 'state', 'zip', 'email', 'phone']
                },
                CompanyResponse: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'string' },
                        addressLine1: { type: 'string' },
                        city: { type: 'string' },
                        state: { type: 'string' },
                        zip: { type: 'string' },
                        email: { type: 'string' },
                        phone: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                UserPreferences: {
                    type: 'object',
                    properties: {
                        theme: {
                            type: 'string',
                            enum: ['light', 'dark', 'system'],
                            description: "User's preferred theme"
                        },
                        emailNotify: {
                            type: 'boolean',
                            description: 'Whether the user wants to receive email notifications'
                        },
                        phoneNumber: {
                            type: 'string',
                            nullable: true,
                            description: "User's phone number (digits only)"
                        }
                    }
                },
                Company: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Company ID'
                        },
                        name: {
                            type: 'string',
                            description: 'Company name'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
                },
                DashboardStats: {
                    type: 'object',
                    properties: {
                        users: {
                            type: 'integer',
                            description: 'Total number of users'
                        },
                        companies: {
                            type: 'integer',
                            description: 'Total number of companies'
                        }
                    }
                },
                ActivityItem: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Activity ID'
                        },
                        userId: {
                            type: 'integer',
                            description: 'User ID who performed the activity'
                        },
                        userName: {
                            type: 'string',
                            description: 'Name of the user who performed the activity'
                        },
                        action: {
                            type: 'string',
                            description: 'Action performed',
                            example: 'created_user'
                        },
                        resourceType: {
                            type: 'string',
                            description: 'Type of resource affected',
                            example: 'user'
                        },
                        resourceId: {
                            type: 'integer',
                            description: 'ID of the resource affected'
                        },
                        details: {
                            type: 'object',
                            description: 'Additional details about the activity'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'When the activity occurred'
                        }
                    }
                },
                ActivityLog: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Activity log ID'
                        },
                        type: {
                            type: 'string',
                            enum: ['proposal', 'template', 'company', 'user'],
                            description: 'Type of entity the activity relates to'
                        },
                        action: {
                            type: 'string',
                            enum: ['created', 'updated', 'deleted'],
                            description: 'Action performed'
                        },
                        title: {
                            type: 'string',
                            description: 'Descriptive title for the activity'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'When the activity occurred'
                        },
                        userId: {
                            type: 'integer',
                            description: 'ID of the user who performed the action'
                        }
                    }
                },
                ActivityLogRequest: {
                    type: 'object',
                    required: ['type', 'action', 'title', 'entityId'],
                    properties: {
                        type: {
                            type: 'string',
                            enum: ['proposal', 'template', 'company', 'user'],
                            description: 'Type of entity the activity relates to'
                        },
                        action: {
                            type: 'string',
                            enum: ['created', 'updated', 'deleted'],
                            description: 'Action performed'
                        },
                        title: {
                            type: 'string',
                            description: 'Descriptive title for the activity'
                        },
                        entityId: {
                            type: 'integer',
                            description: 'ID of the entity the activity relates to'
                        }
                    }
                },
                LogEntry: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        timestamp: { type: 'string', format: 'date-time' },
                        level: { type: 'string', enum: ['debug', 'info', 'warn', 'error'] },
                        context: { type: 'string' },
                        message: { type: 'string' },
                        args: { type: 'object' },
                        metadata: { type: 'object' }
                    }
                }
            },
            responses: {
                Unauthorized: {
                    description: 'Unauthorized - Invalid token or missing token'
                },
                Forbidden: {
                    description: 'Forbidden - Insufficient permissions'
                },
                NotFound: {
                    description: 'Not Found - Resource not found'
                },
                BadRequest: {
                    description: 'Bad Request - Invalid input'
                },
                ServerError: {
                    description: 'Server Error - Internal server error'
                }
            }
        },
        paths: {
            '/api/v1/health': {
                get: {
                    summary: 'Detailed health check',
                    description: 'Get detailed health status of the API and connected services',
                    tags: ['Health v1'],
                    responses: {
                        200: {
                            description: 'Health status',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    status: {
                                                        type: 'string',
                                                        example: 'ok'
                                                    },
                                                    version: {
                                                        type: 'string',
                                                        example: '1.0.0'
                                                    },
                                                    environment: {
                                                        type: 'string',
                                                        example: 'development'
                                                    },
                                                    uptime: {
                                                        type: 'number',
                                                        example: 3600
                                                    },
                                                    timestamp: {
                                                        type: 'string',
                                                        format: 'date-time',
                                                        example: '2023-01-01T00:00:00.000Z'
                                                    },
                                                    services: {
                                                        type: 'object',
                                                        properties: {
                                                            database: {
                                                                type: 'string',
                                                                example: 'connected'
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/v1/health/ping': {
                get: {
                    summary: 'Simple health check',
                    description: 'Simple ping endpoint for monitoring',
                    tags: ['Health v1'],
                    responses: {
                        200: {
                            description: 'Ping response',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    status: {
                                                        type: 'string',
                                                        example: 'ok'
                                                    },
                                                    timestamp: {
                                                        type: 'string',
                                                        format: 'date-time',
                                                        example: '2023-01-01T00:00:00.000Z'
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/v1/users/{id}': {
                get: {
                    summary: 'Get user by ID',
                    description: 'Retrieve a user by their ID. Users can view their own details, admins can view any user.',
                    tags: ['Users v1'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'integer'
                            },
                            description: 'User ID'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'User details',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                                example: true
                                            },
                                            data: {
                                                $ref: '#/components/schemas/UserResponse'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        401: { $ref: '#/components/responses/Unauthorized' },
                        403: { $ref: '#/components/responses/Forbidden' },
                        404: { $ref: '#/components/responses/NotFound' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                },
                put: {
                    summary: 'Update user',
                    description: "Update a user's details. Users can update their own details, admins can update any user.",
                    tags: ['Users v1'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'integer'
                            },
                            description: 'User ID'
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/UserDto'
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'User updated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                                example: true
                                            },
                                            data: {
                                                $ref: '#/components/schemas/UserResponse'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: { $ref: '#/components/responses/BadRequest' },
                        401: { $ref: '#/components/responses/Unauthorized' },
                        403: { $ref: '#/components/responses/Forbidden' },
                        404: { $ref: '#/components/responses/NotFound' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                },
                delete: {
                    summary: 'Delete user',
                    description: 'Delete a user. Requires Site Admin privileges.',
                    tags: ['Users v1'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'integer'
                            },
                            description: 'User ID'
                        }
                    ],
                    responses: {
                        204: {
                            description: 'User deleted successfully'
                        },
                        400: { $ref: '#/components/responses/BadRequest' },
                        401: { $ref: '#/components/responses/Unauthorized' },
                        403: { $ref: '#/components/responses/Forbidden' },
                        404: { $ref: '#/components/responses/NotFound' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/api/v1/auth/login': {
                post: {
                    summary: 'Login user (v1)',
                    tags: ['Auth v1'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/LoginDto'
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Login successful',
                            content: {
                                'application/json': {
                                    schema: {
                                        allOf: [
                                            { $ref: '#/components/schemas/StandardResponse' },
                                            {
                                                type: 'object',
                                                properties: {
                                                    data: {
                                                        type: 'object',
                                                        properties: {
                                                            token: { type: 'string' },
                                                            user: { $ref: '#/components/schemas/UserResponse' }
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        '401': {
                            description: 'Invalid credentials',
                            content: {
                                'application/json': {
                                    schema: {
                                        allOf: [
                                            { $ref: '#/components/schemas/StandardResponse' },
                                            {
                                                type: 'object',
                                                properties: {
                                                    error: {
                                                        type: 'object',
                                                        properties: {
                                                            code: { type: 'string', example: 'AUTH_FAILED' },
                                                            message: { type: 'string', example: 'Invalid credentials' }
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/v1/users/profile/{id}': {
                get: {
                    summary: 'Get user profile by ID (v1)',
                    description: 'Retrieve the profile of a user by their ID. Users can view their own profile, admins can view any user profile.',
                    tags: ['Users v1'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'integer'
                            },
                            description: 'User ID'
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'User profile retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        allOf: [
                                            { $ref: '#/components/schemas/StandardResponse' },
                                            {
                                                type: 'object',
                                                properties: {
                                                    data: { $ref: '#/components/schemas/UserResponse' }
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        '401': {
                            description: 'Not authenticated',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        '403': {
                            description: 'Not authorized to view the requested profile',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        '404': {
                            description: 'User not found',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                },
                put: {
                    summary: 'Update user profile by ID (v1)',
                    description: 'Update a user profile by their ID. Users can update their own profile, admins can update any user profile.',
                    tags: ['Users v1'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'integer'
                            },
                            description: 'User ID'
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        firstName: {
                                            type: 'string',
                                            description: 'User first name'
                                        },
                                        lastName: {
                                            type: 'string',
                                            description: 'User last name'
                                        },
                                        email: {
                                            type: 'string',
                                            format: 'email',
                                            description: 'User email'
                                        },
                                        phoneNumber: {
                                            type: 'string',
                                            description: 'User phone number'
                                        },
                                        roles: {
                                            type: 'array',
                                            items: {
                                                type: 'string',
                                                enum: ['User', 'Admin', 'Site Admin']
                                            },
                                            description: 'User roles (Site Admin only)'
                                        },
                                        emailNotify: {
                                            type: 'boolean',
                                            description: 'Email notifications preference'
                                        },
                                        smsNotify: {
                                            type: 'boolean',
                                            description: 'SMS notifications preference'
                                        },
                                        theme: {
                                            type: 'string',
                                            enum: ['light', 'dark', 'system'],
                                            description: 'UI theme preference'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'User profile updated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        allOf: [
                                            { $ref: '#/components/schemas/StandardResponse' },
                                            {
                                                type: 'object',
                                                properties: {
                                                    data: { $ref: '#/components/schemas/UserResponse' }
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Invalid request parameters',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        '401': {
                            description: 'Not authenticated',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        '403': {
                            description: 'Not authorized to update the requested profile',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        '404': {
                            description: 'User not found',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        },
                        '500': {
                            description: 'Server error',
                            content: {
                                'application/json': {
                                    schema: { $ref: '#/components/schemas/ErrorResponse' }
                                }
                            }
                        }
                    }
                }
            },
            '/api/v1/users/change-password': {
                post: {
                    summary: 'Change user password (v1)',
                    description: 'Change the password for the authenticated user',
                    tags: ['Users v1'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ChangePasswordDto'
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Password changed successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        allOf: [
                                            { $ref: '#/components/schemas/StandardResponse' },
                                            {
                                                type: 'object',
                                                properties: {
                                                    data: {
                                                        type: 'object',
                                                        properties: {
                                                            message: { type: 'string', example: 'Password changed successfully' }
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Invalid request - Password requirements not met'
                        },
                        '401': {
                            description: 'Unauthorized - Invalid current password or not authenticated'
                        }
                    }
                }
            },
            '/api/v1/users': {
                get: {
                    summary: 'Get all users',
                    description: 'Retrieve a list of all users. Requires admin privileges.',
                    tags: ['Users v1'],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: 'A list of users',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                                example: true
                                            },
                                            data: {
                                                type: 'array',
                                                items: {
                                                    $ref: '#/components/schemas/UserResponse'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        401: { $ref: '#/components/responses/Unauthorized' },
                        403: { $ref: '#/components/responses/Forbidden' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                },
                post: {
                    summary: 'Create a new user',
                    description: 'Create a new user. Requires admin privileges for creating users with special roles.',
                    tags: ['Users v1'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/UserDto'
                                }
                            }
                        }
                    },
                    responses: {
                        201: {
                            description: 'User created successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                                example: true
                                            },
                                            data: {
                                                $ref: '#/components/schemas/UserResponse'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: { $ref: '#/components/responses/BadRequest' },
                        401: { $ref: '#/components/responses/Unauthorized' },
                        403: { $ref: '#/components/responses/Forbidden' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/api/v1/users/pending': {
                get: {
                    summary: 'Get pending users',
                    description: 'Retrieve a list of pending users awaiting approval. Requires Site Admin privileges.',
                    tags: ['Users v1'],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        200: {
                            description: 'A list of pending users',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                                example: true
                                            },
                                            data: {
                                                type: 'array',
                                                items: {
                                                    $ref: '#/components/schemas/UserResponse'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        401: { $ref: '#/components/responses/Unauthorized' },
                        403: { $ref: '#/components/responses/Forbidden' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/api/v1/users/{id}/approve': {
                post: {
                    summary: 'Approve a pending user',
                    description: 'Approve a pending user and create their company. Requires Site Admin privileges.',
                    tags: ['Users v1'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'integer'
                            },
                            description: 'User ID'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'User approved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                                example: true
                                            },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    user: {
                                                        $ref: '#/components/schemas/UserResponse'
                                                    },
                                                    company: {
                                                        $ref: '#/components/schemas/CompanyResponse'
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        401: { $ref: '#/components/responses/Unauthorized' },
                        403: { $ref: '#/components/responses/Forbidden' },
                        404: { $ref: '#/components/responses/NotFound' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/api/v1/users/{id}/reject': {
                post: {
                    summary: 'Reject a pending user',
                    description: 'Reject and delete a pending user. Requires Site Admin privileges.',
                    tags: ['Users v1'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'integer'
                            },
                            description: 'User ID'
                        }
                    ],
                    responses: {
                        200: {
                            description: 'User rejected successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                                example: true
                                            },
                                            message: {
                                                type: 'string',
                                                example: 'User rejected and deleted successfully'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        401: { $ref: '#/components/responses/Unauthorized' },
                        403: { $ref: '#/components/responses/Forbidden' },
                        404: { $ref: '#/components/responses/NotFound' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/api/v1/users/{id}/preferences': {
                put: {
                    summary: 'Update user preferences',
                    description: "Update a user's preferences. Users can update their own preferences, admins can update any user's preferences.",
                    tags: ['Users v1'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'integer'
                            },
                            description: 'User ID'
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/UserPreferencesDto'
                                }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'User preferences updated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                                example: true
                                            },
                                            data: {
                                                $ref: '#/components/schemas/UserResponse'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        400: { $ref: '#/components/responses/BadRequest' },
                        401: { $ref: '#/components/responses/Unauthorized' },
                        403: { $ref: '#/components/responses/Forbidden' },
                        404: { $ref: '#/components/responses/NotFound' },
                        500: { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/api/v1/companies': {
                get: {
                    summary: 'Get all companies',
                    description: 'Retrieve a list of all companies. Requires admin privileges.',
                    tags: ['Companies v1'],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '200': {
                            description: 'A list of companies',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                                example: true
                                            },
                                            data: {
                                                type: 'array',
                                                items: {
                                                    $ref: '#/components/schemas/CompanyResponse'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { $ref: '#/components/responses/Unauthorized' },
                        '403': { $ref: '#/components/responses/Forbidden' },
                        '500': { $ref: '#/components/responses/ServerError' }
                    }
                },
                post: {
                    summary: 'Create a new company',
                    description: 'Create a new company. Requires admin privileges.',
                    tags: ['Companies v1'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/CompanyDto'
                                }
                            }
                        }
                    },
                    responses: {
                        '201': {
                            description: 'Company created successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                                example: true
                                            },
                                            data: {
                                                $ref: '#/components/schemas/CompanyResponse'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { $ref: '#/components/responses/BadRequest' },
                        '401': { $ref: '#/components/responses/Unauthorized' },
                        '403': { $ref: '#/components/responses/Forbidden' },
                        '500': { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/api/v1/companies/{id}': {
                get: {
                    summary: 'Get company by ID',
                    description: 'Retrieve a company by its ID. Users can view companies they belong to, admins can view any company.',
                    tags: ['Companies v1'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'integer'
                            },
                            description: 'Company ID'
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Company details',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                                example: true
                                            },
                                            data: {
                                                $ref: '#/components/schemas/CompanyResponse'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { $ref: '#/components/responses/Unauthorized' },
                        '403': { $ref: '#/components/responses/Forbidden' },
                        '404': { $ref: '#/components/responses/NotFound' },
                        '500': { $ref: '#/components/responses/ServerError' }
                    }
                },
                put: {
                    summary: 'Update company',
                    description: 'Update a company\'s details. Requires admin privileges.',
                    tags: ['Companies v1'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'integer'
                            },
                            description: 'Company ID'
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/CompanyDto'
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Company updated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                                example: true
                                            },
                                            data: {
                                                $ref: '#/components/schemas/CompanyResponse'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { $ref: '#/components/responses/BadRequest' },
                        '401': { $ref: '#/components/responses/Unauthorized' },
                        '403': { $ref: '#/components/responses/Forbidden' },
                        '404': { $ref: '#/components/responses/NotFound' },
                        '500': { $ref: '#/components/responses/ServerError' }
                    }
                },
                delete: {
                    summary: 'Delete company',
                    description: 'Delete a company. Requires Site Admin privileges.',
                    tags: ['Companies v1'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'integer'
                            },
                            description: 'Company ID'
                        }
                    ],
                    responses: {
                        '204': {
                            description: 'Company deleted successfully'
                        },
                        '400': { $ref: '#/components/responses/BadRequest' },
                        '401': { $ref: '#/components/responses/Unauthorized' },
                        '403': { $ref: '#/components/responses/Forbidden' },
                        '404': { $ref: '#/components/responses/NotFound' },
                        '500': { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/api/v1/companies/{id}/users': {
                post: {
                    summary: 'Add user to company',
                    description: 'Add a user to a company. Requires admin privileges.',
                    tags: ['Companies v1'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'integer'
                            },
                            description: 'Company ID'
                        }
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['userId'],
                                    properties: {
                                        userId: {
                                            type: 'integer',
                                            description: 'User ID to add to the company'
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': {
                            description: 'User added to company successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                                example: true
                                            },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    message: {
                                                        type: 'string',
                                                        example: 'User 123 added to company 456'
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { $ref: '#/components/responses/BadRequest' },
                        '401': { $ref: '#/components/responses/Unauthorized' },
                        '403': { $ref: '#/components/responses/Forbidden' },
                        '404': { $ref: '#/components/responses/NotFound' },
                        '409': {
                            description: 'Conflict - User is already in the company',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                                example: false
                                            },
                                            error: {
                                                type: 'object',
                                                properties: {
                                                    code: {
                                                        type: 'string',
                                                        example: 'CONFLICT'
                                                    },
                                                    message: {
                                                        type: 'string',
                                                        example: 'User with ID 123 is already in company 456'
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '500': { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/api/v1/companies/{id}/users/{userId}': {
                delete: {
                    summary: 'Remove user from company',
                    description: 'Remove a user from a company. Requires admin privileges.',
                    tags: ['Companies v1'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'path',
                            name: 'id',
                            required: true,
                            schema: {
                                type: 'integer'
                            },
                            description: 'Company ID'
                        },
                        {
                            in: 'path',
                            name: 'userId',
                            required: true,
                            schema: {
                                type: 'integer'
                            },
                            description: 'User ID to remove from the company'
                        }
                    ],
                    responses: {
                        '204': {
                            description: 'User removed from company successfully'
                        },
                        '400': { $ref: '#/components/responses/BadRequest' },
                        '401': { $ref: '#/components/responses/Unauthorized' },
                        '403': { $ref: '#/components/responses/Forbidden' },
                        '404': { $ref: '#/components/responses/NotFound' },
                        '500': { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/api/v1/dashboard/stats': {
                get: {
                    summary: 'Get dashboard statistics',
                    description: 'Retrieve statistics for the dashboard. Requires authentication.',
                    tags: ['Dashboard v1'],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '200': {
                            description: 'Dashboard statistics',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                                example: true
                                            },
                                            data: {
                                                $ref: '#/components/schemas/DashboardStats'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { $ref: '#/components/responses/Unauthorized' },
                        '403': { $ref: '#/components/responses/Forbidden' },
                        '500': { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/api/v1/dashboard/activity': {
                get: {
                    summary: 'Get dashboard activity',
                    description: 'Retrieve recent activity for the dashboard. Requires authentication.',
                    tags: ['Dashboard v1'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'query',
                            name: 'limit',
                            schema: {
                                type: 'integer',
                                default: 10
                            },
                            description: 'Maximum number of activities to return'
                        },
                        {
                            in: 'query',
                            name: 'page',
                            schema: {
                                type: 'integer',
                                default: 1
                            },
                            description: 'Page number for pagination'
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Dashboard activity',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                                example: true
                                            },
                                            data: {
                                                type: 'array',
                                                items: {
                                                    $ref: '#/components/schemas/ActivityItem'
                                                }
                                            },
                                            meta: {
                                                type: 'object',
                                                properties: {
                                                    pagination: {
                                                        type: 'object',
                                                        properties: {
                                                            page: {
                                                                type: 'integer',
                                                                example: 1
                                                            },
                                                            limit: {
                                                                type: 'integer',
                                                                example: 10
                                                            },
                                                            total: {
                                                                type: 'integer',
                                                                example: 50
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { $ref: '#/components/responses/Unauthorized' },
                        '403': { $ref: '#/components/responses/Forbidden' },
                        '500': { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/api/v1/activity/log': {
                post: {
                    summary: 'Log an activity',
                    description: 'Log a new activity. Requires authentication.',
                    tags: ['Activity v1'],
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/ActivityLogRequest'
                                }
                            }
                        }
                    },
                    responses: {
                        '201': {
                            description: 'Activity logged successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                                example: true
                                            },
                                            data: {
                                                $ref: '#/components/schemas/ActivityLog'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { $ref: '#/components/responses/BadRequest' },
                        '401': { $ref: '#/components/responses/Unauthorized' },
                        '500': { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/api/v1/activity/recent': {
                get: {
                    summary: 'Get recent activities',
                    description: 'Retrieve recent activities. Requires authentication.',
                    tags: ['Activity v1'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            in: 'query',
                            name: 'limit',
                            schema: {
                                type: 'integer',
                                default: 10
                            },
                            description: 'Maximum number of activities to return'
                        },
                        {
                            in: 'query',
                            name: 'page',
                            schema: {
                                type: 'integer',
                                default: 1
                            },
                            description: 'Page number for pagination'
                        },
                        {
                            in: 'query',
                            name: 'userId',
                            schema: {
                                type: 'integer'
                            },
                            description: 'Filter activities by user ID'
                        },
                        {
                            in: 'query',
                            name: 'resourceType',
                            schema: {
                                type: 'string'
                            },
                            description: 'Filter activities by resource type'
                        },
                        {
                            in: 'query',
                            name: 'action',
                            schema: {
                                type: 'string'
                            },
                            description: 'Filter activities by action'
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Recent activities',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: {
                                                type: 'boolean',
                                                example: true
                                            },
                                            data: {
                                                type: 'array',
                                                items: {
                                                    $ref: '#/components/schemas/ActivityItem'
                                                }
                                            },
                                            meta: {
                                                type: 'object',
                                                properties: {
                                                    pagination: {
                                                        type: 'object',
                                                        properties: {
                                                            page: {
                                                                type: 'integer',
                                                                example: 1
                                                            },
                                                            limit: {
                                                                type: 'integer',
                                                                example: 10
                                                            },
                                                            total: {
                                                                type: 'integer',
                                                                example: 50
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { $ref: '#/components/responses/Unauthorized' },
                        '403': { $ref: '#/components/responses/Forbidden' },
                        '500': { $ref: '#/components/responses/ServerError' }
                    }
                }
            },
            '/api/v1/logs': {
                get: {
                    tags: ['Logs'],
                    summary: 'Get all application logs with pagination',
                    description: 'Retrieves all application logs with pagination support',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: 'page',
                            in: 'query',
                            description: 'Page number (1-based)',
                            schema: { type: 'integer', default: 1 }
                        },
                        {
                            name: 'limit',
                            in: 'query',
                            description: 'Number of items per page',
                            schema: { type: 'integer', default: 100 }
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Successful operation',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/LogEntry' }
                                            },
                                            meta: {
                                                type: 'object',
                                                properties: {
                                                    pagination: {
                                                        type: 'object',
                                                        properties: {
                                                            page: { type: 'integer' },
                                                            limit: { type: 'integer' },
                                                            total: { type: 'integer' },
                                                            pages: { type: 'integer' }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '500': {
                            description: 'Server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            error: {
                                                type: 'object',
                                                properties: {
                                                    message: { type: 'string' },
                                                    details: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/v1/logs/date/{date}': {
                get: {
                    tags: ['Logs'],
                    summary: 'Get logs for a specific date',
                    description: 'Retrieves application logs for a specific date (YYYY-MM-DD)',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: 'date',
                            in: 'path',
                            required: true,
                            description: 'Date in YYYY-MM-DD format',
                            schema: { type: 'string', format: 'date' }
                        },
                        {
                            name: 'page',
                            in: 'query',
                            description: 'Page number (1-based)',
                            schema: { type: 'integer', default: 1 }
                        },
                        {
                            name: 'limit',
                            in: 'query',
                            description: 'Number of items per page',
                            schema: { type: 'integer', default: 100 }
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Successful operation',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/LogEntry' }
                                            },
                                            meta: {
                                                type: 'object',
                                                properties: {
                                                    pagination: {
                                                        type: 'object',
                                                        properties: {
                                                            page: { type: 'integer' },
                                                            limit: { type: 'integer' },
                                                            total: { type: 'integer' },
                                                            pages: { type: 'integer' }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Invalid date format',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            error: {
                                                type: 'object',
                                                properties: {
                                                    message: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '500': {
                            description: 'Server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            error: {
                                                type: 'object',
                                                properties: {
                                                    message: { type: 'string' },
                                                    details: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/v1/logs/range': {
                get: {
                    tags: ['Logs'],
                    summary: 'Get logs for a date range',
                    description: 'Retrieves application logs for a specific date range',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        {
                            name: 'startDate',
                            in: 'query',
                            required: true,
                            description: 'Start date in YYYY-MM-DD format',
                            schema: { type: 'string', format: 'date' }
                        },
                        {
                            name: 'endDate',
                            in: 'query',
                            required: true,
                            description: 'End date in YYYY-MM-DD format',
                            schema: { type: 'string', format: 'date' }
                        },
                        {
                            name: 'page',
                            in: 'query',
                            description: 'Page number (1-based)',
                            schema: { type: 'integer', default: 1 }
                        },
                        {
                            name: 'limit',
                            in: 'query',
                            description: 'Number of items per page',
                            schema: { type: 'integer', default: 100 }
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Successful operation',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'array',
                                                items: { $ref: '#/components/schemas/LogEntry' }
                                            },
                                            meta: {
                                                type: 'object',
                                                properties: {
                                                    pagination: {
                                                        type: 'object',
                                                        properties: {
                                                            page: { type: 'integer' },
                                                            limit: { type: 'integer' },
                                                            total: { type: 'integer' },
                                                            pages: { type: 'integer' }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Invalid date format or missing parameters',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            error: {
                                                type: 'object',
                                                properties: {
                                                    message: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '500': {
                            description: 'Server error',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            error: {
                                                type: 'object',
                                                properties: {
                                                    message: { type: 'string' },
                                                    details: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/v1/git/config': {
                get: {
                    summary: 'Get Git provider configuration status',
                    description: 'Returns whether Git integration is configured and which provider is set up',
                    tags: ['Git'],
                    responses: {
                        '200': {
                            description: 'Git configuration status',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    configured: { type: 'boolean' },
                                                    provider: { type: 'string', enum: ['github', 'gitlab', null] },
                                                    enabled: { type: 'boolean' },
                                                    disabledByEnv: { type: 'boolean' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/v1/git/connect': {
                get: {
                    summary: 'Start OAuth connection flow',
                    description: 'Redirects to the Git provider OAuth authorization page',
                    tags: ['Git'],
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '302': { description: 'Redirects to OAuth provider' }
                    }
                }
            },
            '/api/v1/git/repos/{projectId}/branches': {
                get: {
                    summary: 'List branches for project repository',
                    tags: ['Git'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'projectId', required: true, schema: { type: 'string', format: 'uuid' } }
                    ],
                    responses: {
                        '200': {
                            description: 'List of branches',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    branches: {
                                                        type: 'array',
                                                        items: {
                                                            type: 'object',
                                                            properties: {
                                                                name: { type: 'string' },
                                                                sha: { type: 'string' },
                                                                isDefault: { type: 'boolean' }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/v1/git/repos/{projectId}/push': {
                post: {
                    summary: 'Push files to repository',
                    description: 'Push generated files to the repository. Set smart=true for AI-generated semantic commit messages.',
                    tags: ['Git'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'projectId', required: true, schema: { type: 'string', format: 'uuid' } }
                    ],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        smart: { type: 'boolean', description: 'Use AI for semantic commit message' },
                                        branch: { type: 'string', description: 'Target branch' },
                                        message: { type: 'string', description: 'Manual commit message (if not smart)' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Push successful' }
                    }
                }
            },
            '/api/v1/git/repos/{projectId}/check-conflicts': {
                get: {
                    summary: 'Check for conflicts before push',
                    description: 'Detects if remote has new commits since last push that may cause conflicts',
                    tags: ['Git'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'projectId', required: true, schema: { type: 'string', format: 'uuid' } },
                        { in: 'query', name: 'branch', required: false, schema: { type: 'string' } }
                    ],
                    responses: {
                        '200': {
                            description: 'Conflict check result',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    hasConflicts: { type: 'boolean' },
                                                    message: { type: 'string' },
                                                    newCommitsCount: { type: 'integer' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/v1/git/repos/{projectId}/history': {
                get: {
                    summary: 'Get push history for project',
                    description: 'Returns list of previous pushes to the repository',
                    tags: ['Git'],
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { in: 'path', name: 'projectId', required: true, schema: { type: 'string', format: 'uuid' } },
                        { in: 'query', name: 'limit', required: false, schema: { type: 'integer', default: 20 } }
                    ],
                    responses: {
                        '200': {
                            description: 'Push history',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    history: {
                                                        type: 'array',
                                                        items: {
                                                            type: 'object',
                                                            properties: {
                                                                id: { type: 'string', format: 'uuid' },
                                                                commitSha: { type: 'string' },
                                                                commitMessage: { type: 'string' },
                                                                branch: { type: 'string' },
                                                                filesCount: { type: 'integer' },
                                                                createdAt: { type: 'string', format: 'date-time' }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: [
        './api/v1/**/*.ts',
        './swagger/**/*.ts'
    ]
});
exports.createSwaggerConfig = createSwaggerConfig;
