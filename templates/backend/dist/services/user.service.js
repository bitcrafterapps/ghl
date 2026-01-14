"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const logger_1 = require("../logger");
const drizzle_orm_1 = require("drizzle-orm");
const activity_service_1 = require("./activity.service");
const logger = logger_1.LoggerFactory.getLogger('UserService');
class UserService {
    static createUser(userData, actorUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            try {
                logger.debug('Creating user:', userData.email, 'by actor:', actorUserId);
                // Hash the password if provided
                const hashedPassword = userData.password ? yield (0, bcrypt_1.hash)(userData.password, 10) : undefined;
                // Insert the user
                const [user] = yield db_1.db.insert(schema_1.users).values({
                    email: userData.email,
                    password: hashedPassword,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    roles: (userData.roles || ['User']),
                    emailNotify: (_a = userData.emailNotify) !== null && _a !== void 0 ? _a : true,
                    smsNotify: (_b = userData.smsNotify) !== null && _b !== void 0 ? _b : false,
                    phoneNumber: userData.phoneNumber || null,
                    theme: userData.theme || 'dark',
                    status: userData.status || 'active',
                    companyName: ((_c = userData.company) === null || _c === void 0 ? void 0 : _c.name) || null,
                    jobTitle: userData.jobTitle || null,
                    selectedPlan: userData.selectedPlan || null,
                    maxProjects: (_d = userData.maxProjects) !== null && _d !== void 0 ? _d : 3,
                    maxGenerations: (_e = userData.maxGenerations) !== null && _e !== void 0 ? _e : 20
                }).returning();
                // If companyId is provided, create the company association
                if (userData.companyId) {
                    yield db_1.db.insert(schema_1.companyUsers).values({
                        companyId: userData.companyId,
                        userId: user.id
                    });
                    logger.debug('User added to company:', userData.companyId);
                }
                // Log activity (use the authenticated user or the created user's ID)
                const logUserId = actorUserId || user.id; // Use actor if provided, else the new user
                try {
                    logger.debug('Logging create activity for userId:', logUserId);
                    yield activity_service_1.ActivityService.logActivity({
                        type: 'user',
                        action: 'created',
                        title: `User: ${user.firstName} ${user.lastName} (${user.email})`,
                        entityId: user.id,
                        userId: logUserId
                    });
                }
                catch (activityError) {
                    // Log the error but continue with user creation
                    logger.error('Failed to log user creation activity:', activityError);
                }
                logger.debug('User created successfully:', user.id);
                const { password } = user, userResponse = __rest(user, ["password"]);
                return Object.assign(Object.assign({}, userResponse), { roles: (userResponse.roles || ['User']), emailNotify: (_f = userResponse.emailNotify) !== null && _f !== void 0 ? _f : true, phoneNumber: (_g = userResponse.phoneNumber) !== null && _g !== void 0 ? _g : null, smsNotify: (_h = userResponse.smsNotify) !== null && _h !== void 0 ? _h : false, theme: (userResponse.theme || 'system'), status: userResponse.status || 'active' });
            }
            catch (error) {
                logger.error('Error creating user:', error);
                throw error;
            }
        });
    }
    static login(loginData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const [user] = yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, loginData.email));
            if (!user || !user.password) {
                throw new Error('Invalid credentials');
            }
            const isPasswordValid = yield (0, bcrypt_1.compare)(loginData.password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET not configured');
            }
            const token = jsonwebtoken_1.default.sign({
                userId: user.id,
                email: user.email,
                roles: user.roles || ['User']
            }, secret, { expiresIn: '24h' });
            logger.debug('User logged in:', user.email);
            const { password } = user, userWithoutPassword = __rest(user, ["password"]);
            return {
                token,
                user: Object.assign(Object.assign({}, userWithoutPassword), { roles: (userWithoutPassword.roles || ['User']), emailNotify: (_a = userWithoutPassword.emailNotify) !== null && _a !== void 0 ? _a : true, phoneNumber: (_b = userWithoutPassword.phoneNumber) !== null && _b !== void 0 ? _b : null, smsNotify: (_c = userWithoutPassword.smsNotify) !== null && _c !== void 0 ? _c : false, theme: (userWithoutPassword.theme || 'system'), status: userWithoutPassword.status || 'active' })
            };
        });
    }
    static getUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const allUsers = yield db_1.db.select().from(schema_1.users);
            return allUsers.map((_a) => {
                var _b, _c, _d;
                var { password } = _a, user = __rest(_a, ["password"]);
                return (Object.assign(Object.assign({}, user), { roles: (user.roles || ['User']), emailNotify: (_b = user.emailNotify) !== null && _b !== void 0 ? _b : true, phoneNumber: (_c = user.phoneNumber) !== null && _c !== void 0 ? _c : null, smsNotify: (_d = user.smsNotify) !== null && _d !== void 0 ? _d : false, theme: (user.theme || 'system'), status: user.status || 'active' }));
            });
        });
    }
    static getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const [user] = yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
            if (!user)
                return null;
            const { password } = user, userResponse = __rest(user, ["password"]);
            return Object.assign(Object.assign({}, userResponse), { roles: (userResponse.roles || ['User']), emailNotify: (_a = userResponse.emailNotify) !== null && _a !== void 0 ? _a : true, phoneNumber: (_b = userResponse.phoneNumber) !== null && _b !== void 0 ? _b : null, smsNotify: (_c = userResponse.smsNotify) !== null && _c !== void 0 ? _c : false, theme: (userResponse.theme || 'system'), status: userResponse.status || 'active' });
        });
    }
    static updateUser(id, userData, actorUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                logger.debug('Updating user:', id, 'by actor:', actorUserId);
                // Check if email is taken by another user
                if (userData.email) {
                    const [existingUser] = yield db_1.db.select()
                        .from(schema_1.users)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.users.email, userData.email), (0, drizzle_orm_1.not)((0, drizzle_orm_1.eq)(schema_1.users.id, id))));
                    if (existingUser) {
                        throw new Error('Email is already taken');
                    }
                }
                // Prepare update data
                const updateData = {
                    updatedAt: new Date()
                };
                if (userData.email !== undefined)
                    updateData.email = userData.email;
                if (userData.firstName !== undefined)
                    updateData.firstName = userData.firstName;
                if (userData.lastName !== undefined)
                    updateData.lastName = userData.lastName;
                if (userData.roles !== undefined)
                    updateData.roles = userData.roles;
                if (userData.emailNotify !== undefined)
                    updateData.emailNotify = userData.emailNotify;
                if (userData.smsNotify !== undefined)
                    updateData.smsNotify = userData.smsNotify;
                if (userData.theme !== undefined)
                    updateData.theme = userData.theme;
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
                    updateData.password = yield (0, bcrypt_1.hash)(userData.password, 10);
                }
                // Update the user
                const [updatedUser] = yield db_1.db.update(schema_1.users)
                    .set(updateData)
                    .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
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
                    yield db_1.db.delete(schema_1.companyUsers).where((0, drizzle_orm_1.eq)(schema_1.companyUsers.userId, id));
                    // Then add the new association if not null
                    if (userData.companyId !== null) {
                        yield db_1.db.insert(schema_1.companyUsers).values({
                            companyId: userData.companyId,
                            userId: id
                        });
                        logger.debug('User updated with new company:', userData.companyId);
                    }
                }
                // Log activity (using the actor's ID if provided)
                logger.debug(`Logging update activity. Actor: ${actorUserId}, Target: ${id}, Final: ${actorUserId || id}`);
                yield activity_service_1.ActivityService.logActivity({
                    type: 'user',
                    action: 'updated',
                    title: `User: ${updatedUser.firstName} ${updatedUser.lastName} (${updatedUser.email})`,
                    entityId: updatedUser.id,
                    userId: actorUserId || id // Use actor's ID, fallback to target user
                });
                logger.debug('User updated successfully:', id);
                const { password } = updatedUser, userResponse = __rest(updatedUser, ["password"]);
                return Object.assign(Object.assign({}, userResponse), { roles: (userResponse.roles || ['User']), emailNotify: (_a = userResponse.emailNotify) !== null && _a !== void 0 ? _a : true, smsNotify: (_b = userResponse.smsNotify) !== null && _b !== void 0 ? _b : false, phoneNumber: (_c = userResponse.phoneNumber) !== null && _c !== void 0 ? _c : null, theme: (userResponse.theme || 'system'), status: userResponse.status || 'active' });
            }
            catch (error) {
                logger.error('Error updating user:', error);
                throw error;
            }
        });
    }
    static deleteUser(id, actorUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger.debug('Deleting user:', id, 'by actor:', actorUserId);
                // Get user before deletion for activity log
                const [userToDelete] = yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
                if (!userToDelete) {
                    logger.warn('User not found for deletion:', id);
                    return false;
                }
                // Delete associated company users first (foreign key constraint)
                yield db_1.db.delete(schema_1.companyUsers).where((0, drizzle_orm_1.eq)(schema_1.companyUsers.userId, id));
                // Delete the user
                const [deletedUser] = yield db_1.db.delete(schema_1.users)
                    .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
                    .returning();
                const success = !!deletedUser;
                if (success) {
                    // Log activity (use the actor who performed the deletion, fallback to deleted user ID)
                    // Note: using deleted user ID isn't ideal but better than nothing if no actor
                    const logUserId = actorUserId || id;
                    logger.debug('Logging delete activity for userId:', logUserId);
                    yield activity_service_1.ActivityService.logActivity({
                        type: 'user',
                        action: 'deleted',
                        title: `User: ${userToDelete.firstName} ${userToDelete.lastName} (${userToDelete.email})`,
                        entityId: id,
                        userId: logUserId
                    });
                    logger.debug('User deleted successfully:', id);
                }
                return success;
            }
            catch (error) {
                logger.error('Error deleting user:', error);
                throw error;
            }
        });
    }
    static changePassword(userId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            // Validate password requirements
            if (newPassword.length < 8) {
                throw new Error('New password must be at least 8 characters long');
            }
            // Get user
            const [user] = yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
            if (!user || !user.password) {
                throw new Error('User not found');
            }
            // Verify current password
            const isCurrentPasswordValid = yield (0, bcrypt_1.compare)(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new Error('Invalid current password');
            }
            // Hash and update new password
            const hashedNewPassword = yield (0, bcrypt_1.hash)(newPassword, 10);
            yield db_1.db.update(schema_1.users)
                .set({
                password: hashedNewPassword,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
            logger.debug('Password changed for user:', user.email);
        });
    }
    // Get pending users awaiting approval
    static getPendingUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger.debug('Fetching pending users');
                const pendingUsers = yield db_1.db
                    .select({
                    id: schema_1.users.id,
                    email: schema_1.users.email,
                    firstName: schema_1.users.firstName,
                    lastName: schema_1.users.lastName,
                    roles: schema_1.users.roles,
                    companyName: schema_1.users.companyName,
                    jobTitle: schema_1.users.jobTitle,
                    selectedPlan: schema_1.users.selectedPlan,
                    status: schema_1.users.status,
                    createdAt: schema_1.users.createdAt
                })
                    .from(schema_1.users)
                    .where((0, drizzle_orm_1.eq)(schema_1.users.status, 'pending'))
                    .orderBy(schema_1.users.createdAt);
                logger.debug(`Found ${pendingUsers.length} pending users with status 'pending'`);
                // Convert roles to UserRole[] to match the PendingUserResponse type
                const typedPendingUsers = pendingUsers.map(user => (Object.assign(Object.assign({}, user), { roles: user.roles, status: user.status })));
                return typedPendingUsers;
            }
            catch (error) {
                logger.error('Error fetching pending users:', error);
                throw error;
            }
        });
    }
}
exports.UserService = UserService;
