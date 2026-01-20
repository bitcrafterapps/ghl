import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users, companyUsers } from '../db/schema';
import { UserDto, LoginDto, LoginResponse, UserResponse, UserRole, ThemeType, PendingUserResponse, UserStatus } from '../types/user.types';
import { LoggerFactory } from '../logger';
import { eq, and, not } from 'drizzle-orm';
import { ActivityService } from './activity.service';

const logger = LoggerFactory.getLogger('UserService');

export class UserService {
    static async createUser(userData: UserDto, actorUserId?: number): Promise<UserResponse> {
        try {
            logger.debug('Creating user:', userData.email, 'by actor:', actorUserId);
            
            // Hash the password if provided
            const hashedPassword = userData.password ? await hash(userData.password, 10) : undefined;
            
            // Insert the user
            const [user] = await db.insert(users).values({
                email: userData.email,
                password: hashedPassword,
                firstName: userData.firstName,
                lastName: userData.lastName,
                roles: (userData.roles || ['User']) as UserRole[],
                emailNotify: userData.emailNotify ?? true,
                smsNotify: userData.smsNotify ?? false,
                phoneNumber: userData.phoneNumber || null,
                theme: userData.theme || 'dark',
                status: userData.status || 'active',
                companyName: userData.company?.name || null,
                jobTitle: userData.jobTitle || null,
                selectedPlan: userData.selectedPlan || null,
                maxProjects: userData.maxProjects ?? 3,
                maxGenerations: userData.maxGenerations ?? 20
            }).returning();
            
            // If companyId is provided, create the company association
            if (userData.companyId) {
                await db.insert(companyUsers).values({
                    companyId: userData.companyId,
                    userId: user.id
                });
                logger.debug('User added to company:', userData.companyId);
            }

            // Log activity (use the authenticated user or the created user's ID)
            const logUserId = actorUserId || user.id; // Use actor if provided, else the new user
            
            try {
                logger.debug('Logging create activity for userId:', logUserId);
                await ActivityService.logActivity({
                    type: 'user',
                    action: 'created',
                    title: `User: ${user.firstName} ${user.lastName} (${user.email})`,
                    entityId: user.id,
                    userId: logUserId
                });
            } catch (activityError) {
                // Log the error but continue with user creation
                logger.error('Failed to log user creation activity:', activityError);
            }
            
            logger.debug('User created successfully:', user.id);
            
            const { password, ...userResponse } = user;
            return { 
                ...userResponse, 
                roles: (userResponse.roles || ['User']) as UserRole[],
                emailNotify: userResponse.emailNotify ?? true,
                phoneNumber: userResponse.phoneNumber ?? null,
                smsNotify: userResponse.smsNotify ?? false,
                theme: (userResponse.theme || 'system') as ThemeType,
                status: userResponse.status as UserStatus || 'active'
            };
        } catch (error) {
            logger.error('Error creating user:', error);
            throw error;
        }
    }

    static async login(loginData: LoginDto): Promise<LoginResponse> {
        const [user] = await db.select().from(users).where(eq(users.email, loginData.email));
        
        if (!user || !user.password) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await compare(loginData.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }

        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email,
                roles: user.roles || ['User']
            },
            secret,
            { expiresIn: '24h' }
        );

        logger.debug('User logged in:', user.email);
        
        const { password, ...userWithoutPassword } = user;
        return {
            token,
            user: { 
                ...userWithoutPassword, 
                roles: (userWithoutPassword.roles || ['User']) as UserRole[],
                emailNotify: userWithoutPassword.emailNotify ?? true,
                phoneNumber: userWithoutPassword.phoneNumber ?? null,
                smsNotify: userWithoutPassword.smsNotify ?? false,
                theme: (userWithoutPassword.theme || 'system') as ThemeType,
                status: userWithoutPassword.status as UserStatus || 'active'
            }
        };
    }

    static async getUsers(): Promise<UserResponse[]> {
        const allUsers = await db.select().from(users);
        return allUsers.map(({ password, ...user }) => ({
            ...user,
            roles: (user.roles || ['User']) as UserRole[],
            emailNotify: user.emailNotify ?? true,
            phoneNumber: user.phoneNumber ?? null,
            smsNotify: user.smsNotify ?? false,
            theme: (user.theme || 'system') as ThemeType,
            status: user.status as UserStatus || 'active'
        }));
    }

    static async getUserById(id: number): Promise<UserResponse | null> {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        if (!user) return null;
        
        const { password, ...userResponse } = user;
        return { 
            ...userResponse, 
            roles: (userResponse.roles || ['User']) as UserRole[],
            emailNotify: userResponse.emailNotify ?? true,
            phoneNumber: userResponse.phoneNumber ?? null,
            smsNotify: userResponse.smsNotify ?? false,
            theme: (userResponse.theme || 'system') as ThemeType,
            status: userResponse.status as UserStatus || 'active'
        };
    }

    static async updateUser(id: number, userData: Partial<UserDto>, actorUserId?: number): Promise<UserResponse | null> {
        try {
            logger.debug('Updating user:', id, 'by actor:', actorUserId);
            
            // Check if email is taken by another user
            if (userData.email) {
                const [existingUser] = await db.select()
                    .from(users)
                    .where(
                        and(
                            eq(users.email, userData.email),
                            not(eq(users.id, id))
                        )
                    );

                if (existingUser) {
                    throw new Error('Email is already taken');
                }
            }
            
            // Prepare update data
            const updateData: Record<string, any> = {
                updatedAt: new Date()
            };
            
            if (userData.email !== undefined) updateData.email = userData.email;
            if (userData.firstName !== undefined) updateData.firstName = userData.firstName;
            if (userData.lastName !== undefined) updateData.lastName = userData.lastName;
            if (userData.roles !== undefined) updateData.roles = userData.roles;
            if (userData.emailNotify !== undefined) updateData.emailNotify = userData.emailNotify;
            if (userData.smsNotify !== undefined) updateData.smsNotify = userData.smsNotify;
            if (userData.theme !== undefined) updateData.theme = userData.theme;
            if (userData.status !== undefined) {
                updateData.status = userData.status;
                logger.debug(`Setting user ${id} status to "${userData.status}"`);
            }
            if (userData.phoneNumber !== undefined) {
                updateData.phoneNumber = userData.phoneNumber === null || userData.phoneNumber === '' 
                    ? null 
                    : String(userData.phoneNumber);
            }
            
            // Handle password update separately (with hashing)
            if (userData.password) {
                updateData.password = await hash(userData.password, 10);
            }
            
            // Update the user
            const [updatedUser] = await db.update(users)
                .set(updateData)
                .where(eq(users.id, id))
                .returning();
            
            if (!updatedUser) {
                logger.warn('User not found for update:', id);
                return null;
            }
            
            logger.debug(`User ${id} updated with data:`, updateData);
            logger.debug(`Updated user result:`, updatedUser);
            
            // Handle company association if provided
            if (userData.companyId !== undefined) {
            // First delete any existing company associations
                await db.delete(companyUsers).where(eq(companyUsers.userId, id));
                
                // Then add the new association if not null
                if (userData.companyId !== null) {
                    await db.insert(companyUsers).values({
                        companyId: userData.companyId,
                        userId: id
                    });
                    logger.debug('User updated with new company:', userData.companyId);
                }
            }

            // Log activity (using the actor's ID if provided)
            logger.debug(`Logging update activity. Actor: ${actorUserId}, Target: ${id}, Final: ${actorUserId || id}`);
            await ActivityService.logActivity({
                type: 'user',
                action: 'updated',
                title: `User: ${updatedUser.firstName} ${updatedUser.lastName} (${updatedUser.email})`,
                entityId: updatedUser.id,
                userId: actorUserId || id // Use actor's ID, fallback to target user
            });
            
            logger.debug('User updated successfully:', id);
            
            const { password, ...userResponse } = updatedUser;
            return { 
                ...userResponse, 
                roles: (userResponse.roles || ['User']) as UserRole[],
                emailNotify: userResponse.emailNotify ?? true,
                smsNotify: userResponse.smsNotify ?? false,
                phoneNumber: userResponse.phoneNumber ?? null,
                theme: (userResponse.theme || 'system') as ThemeType,
                status: userResponse.status as UserStatus || 'active'
            };
        } catch (error) {
            logger.error('Error updating user:', error);
            throw error;
        }
    }

    static async deleteUser(id: number, actorUserId?: number): Promise<boolean> {
        try {
            logger.debug('Deleting user:', id, 'by actor:', actorUserId);
            
            // Get user before deletion for activity log
            const [userToDelete] = await db.select().from(users).where(eq(users.id, id));
            
            if (!userToDelete) {
                logger.warn('User not found for deletion:', id);
                return false;
            }
            
            // Delete associated company users first (foreign key constraint)
            await db.delete(companyUsers).where(eq(companyUsers.userId, id));
            
            // Delete the user
            const [deletedUser] = await db.delete(users)
                .where(eq(users.id, id))
                .returning();
            
            const success = !!deletedUser;
            
            if (success) {
                // Log activity (use the actor who performed the deletion, fallback to deleted user ID)
                // Note: using deleted user ID isn't ideal but better than nothing if no actor
                const logUserId = actorUserId || id;
                
                logger.debug('Logging delete activity for userId:', logUserId);
                await ActivityService.logActivity({
                    type: 'user',
                    action: 'deleted',
                    title: `User: ${userToDelete.firstName} ${userToDelete.lastName} (${userToDelete.email})`,
                    entityId: id,
                    userId: logUserId as number
                });
                
                logger.debug('User deleted successfully:', id);
            }
            
            return success;
        } catch (error) {
            logger.error('Error deleting user:', error);
            throw error;
        }
    }

    static async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
        // Validate password requirements
        if (newPassword.length < 8) {
            throw new Error('New password must be at least 8 characters long');
        }

        // Get user
        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user || !user.password) {
            throw new Error('User not found');
        }

        // Verify current password
        const isCurrentPasswordValid = await compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new Error('Invalid current password');
        }

        // Hash and update new password
        const hashedNewPassword = await hash(newPassword, 10);
        await db.update(users)
            .set({
                password: hashedNewPassword,
                updatedAt: new Date()
            })
            .where(eq(users.id, userId));

        logger.debug('Password changed for user:', user.email);
    }

    // Get pending users awaiting approval
    static async getPendingUsers(): Promise<PendingUserResponse[]> {
        try {
            logger.debug('Fetching pending users');
            
            const pendingUsers = await db
                .select({
                    id: users.id,
                    email: users.email,
                    firstName: users.firstName,
                    lastName: users.lastName,
                    roles: users.roles,
                    companyName: users.companyName,
                    jobTitle: users.jobTitle,
                    selectedPlan: users.selectedPlan,
                    status: users.status,
                    createdAt: users.createdAt
                })
                .from(users)
                .where(eq(users.status, 'pending'))
                .orderBy(users.createdAt);
            
            logger.debug(`Found ${pendingUsers.length} pending users with status 'pending'`);
            
            // Convert roles to UserRole[] to match the PendingUserResponse type
            const typedPendingUsers = pendingUsers.map(user => ({
                ...user,
                roles: user.roles as UserRole[],
                status: user.status as UserStatus
            }));
            
            return typedPendingUsers;
        } catch (error) {
            logger.error('Error fetching pending users:', error);
            throw error;
        }
    }
} 