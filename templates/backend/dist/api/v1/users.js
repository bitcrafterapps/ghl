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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const logger_1 = require("../../logger");
const response_types_1 = require("../../types/api/response.types");
const auth_middleware_1 = require("../../middleware/v1/auth.middleware");
const user_service_1 = require("../../services/user.service");
// Use mergeParams: true to ensure req properties are inherited from parent router
const router = (0, express_1.Router)({ mergeParams: true });
const logger = logger_1.LoggerFactory.getLogger("UsersAPI");
// Log middleware to debug route matching
router.use((req, res, next) => {
    logger.debug(`Request received: ${req.method} ${req.originalUrl}, params: ${JSON.stringify(req.params)}`);
    next();
});
// GET USER PROFILE ROUTER FUNCTIONALITY
router.get("/profile", auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.debug(`Profile request received, user object: ${JSON.stringify(req.user)}`);
        logger.debug(`Request path: ${req.path}, originalUrl: ${req.originalUrl}`);
        if (!req.user) {
            logger.error("User object not found in request");
            return res
                .status(401)
                .json((0, response_types_1.createErrorResponse)("UNAUTHORIZED", "Authentication required"));
        }
        // Extract userId from the user object, handling different formats
        logger.debug(`Raw user object: ${JSON.stringify(req.user)}`);
        logger.debug(`User object properties: ${Object.keys(req.user).join(", ")}`);
        // Try different ways to access the user ID
        // Extract userId from the user object
        // Since we are using strict typing and authenticate middleware, req.user acts as the source of truth
        const userId = req.user.userId;
        logger.debug(`Extracted userId: ${userId}, type: ${typeof userId}`);
        if (!userId) {
            logger.error("User ID is undefined or null");
            // Return the user object in the error for debugging
            return res
                .status(400)
                .json((0, response_types_1.createErrorResponse)("INVALID_ID", "User ID is undefined or null", {
                userObject: req.user,
            }));
        }
        if (isNaN(Number(userId))) {
            logger.error(`User ID is not a number: ${userId}`);
            return res
                .status(400)
                .json((0, response_types_1.createErrorResponse)("INVALID_ID", "User ID is not a number", {
                userId,
            }));
        }
        // Convert to number to ensure consistent type
        const userIdNum = Number(userId);
        logger.debug(`Converted userId to number: ${userIdNum}`);
        // Fetch user profile from database
        const [userProfile] = yield db_1.db
            .select({
            id: schema_1.users.id,
            email: schema_1.users.email,
            firstName: schema_1.users.firstName,
            lastName: schema_1.users.lastName,
            roles: schema_1.users.roles,
            emailNotify: schema_1.users.emailNotify,
            smsNotify: schema_1.users.smsNotify,
            phoneNumber: schema_1.users.phoneNumber,
            theme: schema_1.users.theme,
            createdAt: schema_1.users.createdAt,
            updatedAt: schema_1.users.updatedAt,
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userIdNum));
        logger.debug(`Database query result: ${userProfile ? "User found" : "User not found"}`);
        if (!userProfile) {
            logger.error(`User not found for ID: ${userIdNum}`);
            return res
                .status(404)
                .json((0, response_types_1.createErrorResponse)("USER_NOT_FOUND", "User not found"));
        }
        // Get user's company information
        const userCompany = yield db_1.db
            .select({
            companyId: schema_1.companyUsers.companyId,
        })
            .from(schema_1.companyUsers)
            .where((0, drizzle_orm_1.eq)(schema_1.companyUsers.userId, userIdNum))
            .limit(1);
        // Add company ID to response if available
        if (userCompany.length > 0) {
            const userWithCompany = Object.assign(Object.assign({}, userProfile), { companyId: userCompany[0].companyId });
            logger.debug(`Returning user profile with company ID: ${userCompany[0].companyId}`);
            return res.json((0, response_types_1.createSuccessResponse)(userWithCompany));
        }
        // Special case for known users
        if (userProfile.email === "paul@genwith.ai" ||
            userProfile.email === "john@genwith.ai") {
            const userWithCompany = Object.assign(Object.assign({}, userProfile), { companyId: 1 });
            logger.debug(`Special case: Setting company ID to 1 for ${userProfile.email}`);
            return res.json((0, response_types_1.createSuccessResponse)(userWithCompany));
        }
        // Return user without company ID
        logger.debug(`Returning user profile without company ID`);
        return res.json((0, response_types_1.createSuccessResponse)(userProfile));
    }
    catch (error) {
        logger.error("Error fetching user profile:", error);
        return res
            .status(500)
            .json((0, response_types_1.createErrorResponse)("SERVER_ERROR", "Failed to fetch user profile", error));
    }
}));
// UPDATE USER PROFILE ROUTER FUNCTIONALITY
router.put("/profile/", auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Try different ways to access the user ID
        // Use typed userId
        const targetUserId = req.user.userId;
        if (isNaN(targetUserId) || targetUserId <= 0) {
            logger.error(`Invalid user ID: ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.userId}`);
            return res
                .status(400)
                .json((0, response_types_1.createErrorResponse)("INVALID_ID", "Invalid user ID"));
        }
        // Check if user has permission to update this profile
        if (targetUserId !== req.user.userId) {
            logger.debug(`User ${req.user.userId} attempting to update profile of user ${targetUserId}`);
            const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
            if (!currentUser ||
                !currentUser.roles.some((role) => ["Admin", "Site Admin"].includes(role))) {
                logger.error(`User ${req.user.userId} not authorized to update profile of user ${targetUserId}`);
                return res
                    .status(403)
                    .json((0, response_types_1.createErrorResponse)("UNAUTHORIZED", "You do not have permission to update this user profile"));
            }
        }
        // Check if user is trying to update roles
        if (req.body.roles) {
            const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
            if (!currentUser || !currentUser.roles.includes("Site Admin")) {
                logger.error(`User ${req.user.userId} attempted to update roles without Site Admin privileges`);
                return res
                    .status(403)
                    .json((0, response_types_1.createErrorResponse)("UNAUTHORIZED", "You do not have permission to update user roles"));
            }
        }
        // Update the user
        const updatedUser = yield user_service_1.UserService.updateUser(targetUserId, req.body, req.user.userId);
        if (!updatedUser) {
            logger.error(`User not found for ID: ${targetUserId}`);
            return res
                .status(404)
                .json((0, response_types_1.createErrorResponse)("USER_NOT_FOUND", "User not found"));
        }
        logger.debug(`User profile updated successfully for ID: ${targetUserId}`);
        return res.json((0, response_types_1.createSuccessResponse)(updatedUser));
    }
    catch (error) {
        logger.error("Error updating user profile:", error);
        return res
            .status(400)
            .json((0, response_types_1.createErrorResponse)("PROFILE_UPDATE_FAILED", error instanceof Error
            ? error.message
            : "Failed to update user profile", error));
    }
}));
// GET USER PROFILE BY ID ROUTER FUNCTIONALITY
router.get("/profile/:id", auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const targetUserId = Number(req.params.id);
        logger.debug(`Fetching profile for specific user ID: ${targetUserId}`);
        if (isNaN(targetUserId) || targetUserId <= 0) {
            logger.error(`Invalid user ID parameter: ${req.params.id}`);
            return res
                .status(400)
                .json((0, response_types_1.createErrorResponse)("INVALID_ID", "Invalid user ID"));
        }
        // Get the current user's ID
        const currentUserId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
        if (!currentUserId) {
            logger.error("User ID not found in authenticated request");
            return res
                .status(401)
                .json((0, response_types_1.createErrorResponse)("UNAUTHORIZED", "Authentication required"));
        }
        // Check if user is requesting their own profile or is an admin
        if (Number(currentUserId) !== targetUserId) {
            // Check if user has admin privileges
            const currentUser = yield user_service_1.UserService.getUserById(Number(currentUserId));
            const isAdmin = currentUser === null || currentUser === void 0 ? void 0 : currentUser.roles.some((role) => ["Admin", "Site Admin"].includes(role));
            if (!isAdmin) {
                logger.error(`User ${currentUserId} not authorized to view profile of user ${targetUserId}`);
                return res
                    .status(403)
                    .json((0, response_types_1.createErrorResponse)("FORBIDDEN", "You do not have permission to view this profile"));
            }
        }
        // Fetch user profile from database
        const [userProfile] = yield db_1.db
            .select({
            id: schema_1.users.id,
            email: schema_1.users.email,
            firstName: schema_1.users.firstName,
            lastName: schema_1.users.lastName,
            roles: schema_1.users.roles,
            emailNotify: schema_1.users.emailNotify,
            smsNotify: schema_1.users.smsNotify,
            phoneNumber: schema_1.users.phoneNumber,
            theme: schema_1.users.theme,
            createdAt: schema_1.users.createdAt,
            updatedAt: schema_1.users.updatedAt,
        })
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, targetUserId));
        if (!userProfile) {
            logger.error(`User not found for ID: ${targetUserId}`);
            return res
                .status(404)
                .json((0, response_types_1.createErrorResponse)("USER_NOT_FOUND", "User not found"));
        }
        // Get user's company information
        const userCompany = yield db_1.db
            .select({
            companyId: schema_1.companyUsers.companyId,
        })
            .from(schema_1.companyUsers)
            .where((0, drizzle_orm_1.eq)(schema_1.companyUsers.userId, targetUserId))
            .limit(1);
        // Add company ID to response if available
        if (userCompany.length > 0) {
            const userWithCompany = Object.assign(Object.assign({}, userProfile), { companyId: userCompany[0].companyId });
            return res.json((0, response_types_1.createSuccessResponse)(userWithCompany));
        }
        // Return user without company ID
        return res.json((0, response_types_1.createSuccessResponse)(userProfile));
    }
    catch (error) {
        logger.error("Error fetching user profile by ID:", error);
        return res
            .status(500)
            .json((0, response_types_1.createErrorResponse)("SERVER_ERROR", "Failed to fetch user profile", error));
    }
}));
// CHANGE PASSWORD ROUTER FUNCTIONALITY
router.post("/change-password", auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            return res
                .status(401)
                .json((0, response_types_1.createErrorResponse)("AUTH_REQUIRED", "Authentication required"));
        }
        yield user_service_1.UserService.changePassword(Number(req.user.userId), req.body.currentPassword, req.body.newPassword);
        logger.debug(`Password changed successfully for user ID: ${req.user.userId}`);
        res.json((0, response_types_1.createSuccessResponse)({
            message: "Password changed successfully",
        }));
    }
    catch (error) {
        logger.error("Error changing password:", error);
        if (error instanceof Error &&
            error.message === "Invalid current password") {
            return res
                .status(401)
                .json((0, response_types_1.createErrorResponse)("AUTH_INVALID_PASSWORD", "Invalid current password"));
        }
        res
            .status(400)
            .json((0, response_types_1.createErrorResponse)("PASSWORD_CHANGE_FAILED", error instanceof Error ? error.message : "Failed to change password"));
    }
}));
// GET PENDING USERS ROUTER FUNCTIONALITY
router.get("/pending", auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.debug("Fetching pending users");
        // Check if user has Site Admin role
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.includes("Site Admin")) {
            logger.debug(`User ${req.user.userId} attempted to access pending users without Site Admin privileges`);
            return res
                .status(403)
                .json((0, response_types_1.createErrorResponse)("FORBIDDEN", "You do not have permission to access this resource"));
        }
        const pendingUsers = yield user_service_1.UserService.getPendingUsers();
        res.json((0, response_types_1.createSuccessResponse)(pendingUsers));
    }
    catch (error) {
        logger.error("Error fetching pending users:", error);
        res
            .status(500)
            .json((0, response_types_1.createErrorResponse)("SERVER_ERROR", "Failed to fetch pending users", error));
    }
}));
// GET ALL USERS ROUTER FUNCTIONALITY
router.get("/", auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.debug("Fetching all users");
        // Check if user has admin role
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser ||
            !currentUser.roles.some((role) => ["Admin", "Site Admin"].includes(role))) {
            logger.debug(`User ${req.user.userId} attempted to access users list without admin privileges`);
            return res
                .status(403)
                .json((0, response_types_1.createErrorResponse)("FORBIDDEN", "You do not have permission to access this resource"));
        }
        const users = yield user_service_1.UserService.getUsers();
        res.json((0, response_types_1.createSuccessResponse)(users));
    }
    catch (error) {
        logger.error("Error fetching users:", error);
        res
            .status(500)
            .json((0, response_types_1.createErrorResponse)("SERVER_ERROR", "Failed to fetch users", error));
    }
}));
// CREATE USER ROUTER FUNCTIONALITY
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        logger.debug("Creating new user:", req.body.email);
        // Check if user has admin role for creating users with special roles
        if (req.body.roles &&
            req.body.roles.some((role) => ["Admin", "Site Admin"].includes(role)) &&
            req.user // Only check if user is authenticated
        ) {
            const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
            if (!currentUser || !currentUser.roles.includes("Site Admin")) {
                logger.debug(`User ${req.user.userId} attempted to create user with admin privileges`);
                return res
                    .status(403)
                    .json((0, response_types_1.createErrorResponse)("FORBIDDEN", "You do not have permission to create users with admin privileges"));
            }
        }
        const user = yield user_service_1.UserService.createUser(req.body, (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
        res.status(201).json((0, response_types_1.createSuccessResponse)(user));
    }
    catch (error) {
        logger.error("Error creating user:", error);
        res
            .status(400)
            .json((0, response_types_1.createErrorResponse)("USER_CREATE_FAILED", error instanceof Error ? error.message : "Failed to create user", error));
    }
}));
// GET USER ROUTER FUNCTIONALITY
router.get("/:id", auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res
                .status(400)
                .json((0, response_types_1.createErrorResponse)("INVALID_ID", "Invalid user ID"));
        }
        logger.debug(`Fetching user with ID: ${userId}`);
        // Check if user has permission to view other users
        if (userId !== req.user.userId) {
            const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
            if (!currentUser ||
                !currentUser.roles.some((role) => ["Admin", "Site Admin"].includes(role))) {
                logger.debug(`User ${req.user.userId} attempted to access user ${userId} without admin privileges`);
                return res
                    .status(403)
                    .json((0, response_types_1.createErrorResponse)("FORBIDDEN", "You do not have permission to access this resource"));
            }
        }
        const user = yield user_service_1.UserService.getUserById(userId);
        if (!user) {
            return res
                .status(404)
                .json((0, response_types_1.createErrorResponse)("USER_NOT_FOUND", "User not found"));
        }
        res.json((0, response_types_1.createSuccessResponse)(user));
    }
    catch (error) {
        logger.error("Error fetching user:", error);
        res
            .status(500)
            .json((0, response_types_1.createErrorResponse)("SERVER_ERROR", "Failed to fetch user", error));
    }
}));
// UPDATE USER ROUTER FUNCTIONALITY
router.put("/:id", auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res
                .status(400)
                .json((0, response_types_1.createErrorResponse)("INVALID_ID", "Invalid user ID"));
        }
        logger.debug(`Updating user with ID: ${userId}`);
        // Check if user has permission to update other users
        if (userId !== req.user.userId) {
            const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
            if (!currentUser ||
                !currentUser.roles.some((role) => ["Admin", "Site Admin"].includes(role))) {
                logger.debug(`User ${req.user.userId} attempted to update user ${userId} without admin privileges`);
                return res
                    .status(403)
                    .json((0, response_types_1.createErrorResponse)("FORBIDDEN", "You do not have permission to update this user"));
            }
        }
        // Check if user is trying to update roles
        if (req.body.roles) {
            const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
            if (!currentUser || !currentUser.roles.includes("Site Admin")) {
                logger.debug(`User ${req.user.userId} attempted to update roles for user ${userId} without Site Admin privileges`);
                return res
                    .status(403)
                    .json((0, response_types_1.createErrorResponse)("FORBIDDEN", "You do not have permission to update user roles"));
            }
        }
        const user = yield user_service_1.UserService.updateUser(userId, req.body, req.user.userId);
        if (!user) {
            return res
                .status(404)
                .json((0, response_types_1.createErrorResponse)("USER_NOT_FOUND", "User not found"));
        }
        res.json((0, response_types_1.createSuccessResponse)(user));
    }
    catch (error) {
        logger.error("Error updating user:", error);
        res
            .status(400)
            .json((0, response_types_1.createErrorResponse)("USER_UPDATE_FAILED", error instanceof Error ? error.message : "Failed to update user", error));
    }
}));
// DELETE USER ROUTER FUNCTIONALITY
router.delete("/:id", auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res
                .status(400)
                .json((0, response_types_1.createErrorResponse)("INVALID_ID", "Invalid user ID"));
        }
        logger.debug(`Deleting user with ID: ${userId}`);
        // Check if user has permission to delete users
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.includes("Site Admin")) {
            logger.debug(`User ${req.user.userId} attempted to delete user ${userId} without Site Admin privileges`);
            return res
                .status(403)
                .json((0, response_types_1.createErrorResponse)("FORBIDDEN", "You do not have permission to delete users"));
        }
        // Prevent self-deletion
        if (userId === req.user.userId) {
            return res
                .status(400)
                .json((0, response_types_1.createErrorResponse)("SELF_DELETE_FORBIDDEN", "You cannot delete your own account"));
        }
        const success = yield user_service_1.UserService.deleteUser(userId, req.user.userId);
        if (!success) {
            return res
                .status(404)
                .json((0, response_types_1.createErrorResponse)("USER_NOT_FOUND", "User not found"));
        }
        res.status(204).send();
    }
    catch (error) {
        logger.error("Error deleting user:", error);
        res
            .status(500)
            .json((0, response_types_1.createErrorResponse)("SERVER_ERROR", "Failed to delete user", error));
    }
}));
// APPROVE USER ROUTER FUNCTIONALITY
router.post("/:id/approve", auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res
                .status(400)
                .json((0, response_types_1.createErrorResponse)("INVALID_ID", "Invalid user ID"));
        }
        logger.debug(`Approving user with ID: ${userId}`);
        // Check if user has Site Admin role
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.includes("Site Admin")) {
            logger.debug(`User ${req.user.userId} attempted to approve user ${userId} without Site Admin privileges`);
            return res
                .status(403)
                .json((0, response_types_1.createErrorResponse)("FORBIDDEN", "You do not have permission to approve users"));
        }
        // Get the pending user details
        const user = yield user_service_1.UserService.getUserById(userId);
        if (!user) {
            return res
                .status(404)
                .json((0, response_types_1.createErrorResponse)("USER_NOT_FOUND", "User not found"));
        }
        // 1. Create a company using the user's company name
        const companyName = user.companyName || `${user.firstName}'s Company`;
        const [company] = yield db_1.db
            .insert(schema_1.companies)
            .values({
            name: companyName,
            addressLine1: "", // Default values
            city: "",
            state: "",
            zip: "",
            email: user.email,
            phone: user.phoneNumber || "",
            industry: "",
            size: "",
        })
            .returning();
        logger.debug(`Created company "${company.name}" (ID: ${company.id}) for approved user ${userId}`);
        // 2. Add the user to the company
        yield db_1.db.insert(schema_1.companyUsers).values({
            companyId: company.id,
            userId: userId,
        });
        logger.debug(`Added user ${userId} to company ${company.id}`);
        // 3. Update the user - set status to active and add Admin role
        const userRoles = [...(user.roles || [])];
        if (!userRoles.includes("Admin")) {
            userRoles.push("Admin");
        }
        logger.debug(`Before update: User ${userId} has status "${user.status}" and roles ${JSON.stringify(user.roles)}`);
        // Explicitly set status to 'active' to ensure it's updated
        const updatedUser = yield user_service_1.UserService.updateUser(userId, {
            status: "active",
            roles: userRoles,
        }, req.user.userId);
        logger.debug(`After update: User ${userId} now has status "${updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.status}" and roles ${JSON.stringify(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.roles)}`);
        logger.debug(`Updated user ${userId} status to 'active' and roles to ${JSON.stringify(userRoles)}`);
        // Verify the user's status directly from the database
        const [verifiedUser] = yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
        logger.debug(`Verified user ${userId} from database:`, verifiedUser);
        if (!updatedUser) {
            return res
                .status(404)
                .json((0, response_types_1.createErrorResponse)("USER_UPDATE_FAILED", "Failed to update user status"));
        }
        logger.debug(`User ${userId} was approved by admin ${req.user.userId} and given Admin role`);
        res.json((0, response_types_1.createSuccessResponse)({
            message: "User approved successfully",
            user: updatedUser,
            company: company,
        }));
    }
    catch (error) {
        logger.error("Error approving user:", error);
        res
            .status(500)
            .json((0, response_types_1.createErrorResponse)("SERVER_ERROR", "Failed to approve user", error));
    }
}));
// REJECT USER ROUTER FUNCTIONALITY
router.post("/:id/reject", auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res
                .status(400)
                .json((0, response_types_1.createErrorResponse)("INVALID_ID", "Invalid user ID"));
        }
        logger.debug(`Rejecting user with ID: ${userId}`);
        // Check if user has Site Admin role
        const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.includes("Site Admin")) {
            logger.debug(`User ${req.user.userId} attempted to reject user ${userId} without Site Admin privileges`);
            return res
                .status(403)
                .json((0, response_types_1.createErrorResponse)("FORBIDDEN", "You do not have permission to reject users"));
        }
        // First check if the user exists
        const user = yield user_service_1.UserService.getUserById(userId);
        if (!user) {
            return res
                .status(404)
                .json((0, response_types_1.createErrorResponse)("USER_NOT_FOUND", "User not found"));
        }
        // Delete the user
        const success = yield user_service_1.UserService.deleteUser(userId, req.user.userId);
        if (!success) {
            return res
                .status(404)
                .json((0, response_types_1.createErrorResponse)("USER_DELETE_FAILED", "Failed to delete rejected user"));
        }
        logger.debug(`User ${userId} was rejected and deleted by admin ${req.user.userId}`);
        res.json((0, response_types_1.createSuccessResponse)({
            message: "User rejected and deleted successfully",
        }));
    }
    catch (error) {
        logger.error("Error rejecting user:", error);
        res
            .status(500)
            .json((0, response_types_1.createErrorResponse)("SERVER_ERROR", "Failed to reject user", error));
    }
}));
// UPDATE USER PREFERENCES ROUTER FUNCTIONALITY
router.put("/:id/preferences", auth_middleware_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = parseInt(req.params.id);
        if (isNaN(userId)) {
            return res
                .status(400)
                .json((0, response_types_1.createErrorResponse)("INVALID_ID", "Invalid user ID"));
        }
        logger.debug(`Updating preferences for user ID: ${userId}`);
        // Check if user has permission to update preferences
        if (userId !== req.user.userId) {
            const currentUser = yield user_service_1.UserService.getUserById(req.user.userId);
            if (!currentUser ||
                !currentUser.roles.some((role) => ["Admin", "Site Admin"].includes(role))) {
                logger.debug(`User ${req.user.userId} attempted to update preferences for user ${userId} without admin privileges`);
                return res
                    .status(403)
                    .json((0, response_types_1.createErrorResponse)("FORBIDDEN", "You do not have permission to update preferences for this user"));
            }
        }
        // Create a clean preferences object
        const preferences = {
            emailNotify: req.body.emailNotify,
            theme: req.body.theme,
        };
        // Handle phone number
        if ("phoneNumber" in req.body) {
            if (req.body.phoneNumber === null || req.body.phoneNumber === "") {
                preferences.phoneNumber = null;
            }
            else {
                const phoneStr = String(req.body.phoneNumber).trim();
                if (!/^\d+$/.test(phoneStr)) {
                    return res
                        .status(400)
                        .json((0, response_types_1.createErrorResponse)("INVALID_PHONE", "Phone number must contain only digits"));
                }
                preferences.phoneNumber = phoneStr;
            }
        }
        const user = yield user_service_1.UserService.updateUser(userId, preferences, req.user.userId);
        if (!user) {
            return res
                .status(404)
                .json((0, response_types_1.createErrorResponse)("USER_NOT_FOUND", "User not found"));
        }
        res.json((0, response_types_1.createSuccessResponse)(user));
    }
    catch (error) {
        logger.error("Error updating preferences:", error);
        res
            .status(400)
            .json((0, response_types_1.createErrorResponse)("PREFERENCES_UPDATE_FAILED", error instanceof Error
            ? error.message
            : "Failed to update preferences", error));
    }
}));
logger.info("All user routes mounted successfully");
exports.default = router;
