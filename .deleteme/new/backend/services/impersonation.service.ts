import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { LoggerFactory } from '../logger';
import { UserRole, UserStatus, ThemeType } from '../types/user.types';

const logger = LoggerFactory.getLogger('ImpersonationService');

export class ImpersonationService {
    /**
     * Generate an impersonation token for an admin to act as a target user
     * @param adminUserId The ID of the admin performing the impersonation
     * @param targetUserId The ID of the user to impersonate
     */
    static async impersonateUser(adminUserId: number, targetUserId: number) {
        try {
            logger.info(`Admin ${adminUserId} attempting to impersonate user ${targetUserId}`);

            // 1. Verify Admin (Caller) - though middleware should handle role check, we double check existence
            const [admin] = await db.select().from(users).where(eq(users.id, adminUserId));
            if (!admin) {
                throw new Error('Admin user not found');
            }

            // 2. Verify Target User
            const [targetUser] = await db.select().from(users).where(eq(users.id, targetUserId));
            if (!targetUser) {
                throw new Error('Target user not found');
            }

            // 3. Prevent impersonating other Site Admins (Optional security measure, usually good practice)
            // if (targetUser.roles && targetUser.roles.includes('Site Admin')) {
            //     throw new Error('Cannot impersonate another Site Admin');
            // }

            // 4. Generate Token with impersonatorId claim
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET not configured');
            }

            const token = jwt.sign(
                { 
                    userId: targetUser.id,
                    email: targetUser.email,
                    roles: targetUser.roles || ['User'],
                    impersonatorId: admin.id // The Magic Claim
                },
                secret,
                { expiresIn: '1h' } // Shorter expiry for impersonation sessions
            );

            logger.info(`Impersonation token generated for Admin ${adminUserId} -> User ${targetUserId}`);

            const { password, ...userWithoutPassword } = targetUser;
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

        } catch (error) {
            logger.error('Error during impersonation:', error);
            throw error;
        }
    }
}
