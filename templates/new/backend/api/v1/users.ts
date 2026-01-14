import { Router, Request, Response, NextFunction } from "express";
import { db } from "../../db";
import { users, companyUsers, companies } from "../../db/schema";
import { eq } from "drizzle-orm";
import { LoggerFactory } from "../../logger";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../types/api/response.types";
import { authenticate } from "../../middleware/v1/auth.middleware";
import { UserService } from "../../services/user.service";
import {
  UserDto,
  UserPreferencesDto,
  ChangePasswordDto,
  UserRole,
} from "../../types/user.types";

// Use mergeParams: true to ensure req properties are inherited from parent router
const router = Router({ mergeParams: true });
const logger = LoggerFactory.getLogger("UsersAPI");

// Log middleware to debug route matching
router.use((req, res, next) => {
  logger.debug(
    `Request received: ${req.method} ${
      req.originalUrl
    }, params: ${JSON.stringify(req.params)}`
  );
  next();
});

// GET USER PROFILE ROUTER FUNCTIONALITY
router.get("/profile", authenticate, async (req: Request, res: Response) => {
  try {
    logger.debug(
      `Profile request received, user object: ${JSON.stringify(req.user)}`
    );
    logger.debug(`Request path: ${req.path}, originalUrl: ${req.originalUrl}`);

    if (!req.user) {
      logger.error("User object not found in request");
      return res
        .status(401)
        .json(createErrorResponse("UNAUTHORIZED", "Authentication required"));
    }

    // Extract userId from the user object, handling different formats
    logger.debug(`Raw user object: ${JSON.stringify(req.user)}`);
    logger.debug(`User object properties: ${Object.keys(req.user).join(", ")}`);

    // Try different ways to access the user ID
    // Extract userId from the user object
    // Since we are using strict typing and authenticate middleware, req.user acts as the source of truth
    const userId = req.user!.userId;

    logger.debug(`Extracted userId: ${userId}, type: ${typeof userId}`);

    if (!userId) {
      logger.error("User ID is undefined or null");
      // Return the user object in the error for debugging
      return res
        .status(400)
        .json(
          createErrorResponse("INVALID_ID", "User ID is undefined or null", {
            userObject: req.user,
          })
        );
    }

    if (isNaN(Number(userId))) {
      logger.error(`User ID is not a number: ${userId}`);
      return res
        .status(400)
        .json(
          createErrorResponse("INVALID_ID", "User ID is not a number", {
            userId,
          })
        );
    }

    // Convert to number to ensure consistent type
    const userIdNum = Number(userId);
    logger.debug(`Converted userId to number: ${userIdNum}`);

    // Fetch user profile from database
    const [userProfile] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        roles: users.roles,
        emailNotify: users.emailNotify,
        smsNotify: users.smsNotify,
        phoneNumber: users.phoneNumber,
        theme: users.theme,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userIdNum));

    logger.debug(
      `Database query result: ${userProfile ? "User found" : "User not found"}`
    );

    if (!userProfile) {
      logger.error(`User not found for ID: ${userIdNum}`);
      return res
        .status(404)
        .json(createErrorResponse("USER_NOT_FOUND", "User not found"));
    }

    // Get user's company information
    const userCompany = await db
      .select({
        companyId: companyUsers.companyId,
      })
      .from(companyUsers)
      .where(eq(companyUsers.userId, userIdNum))
      .limit(1);

    // Add company ID to response if available
    if (userCompany.length > 0) {
      const userWithCompany = {
        ...userProfile,
        companyId: userCompany[0].companyId,
      };

      logger.debug(
        `Returning user profile with company ID: ${userCompany[0].companyId}`
      );
      return res.json(createSuccessResponse(userWithCompany));
    }

    // Special case for known users
    if (
      userProfile.email === "paul@genwith.ai" ||
      userProfile.email === "john@genwith.ai"
    ) {
      const userWithCompany = {
        ...userProfile,
        companyId: 1,
      };

      logger.debug(
        `Special case: Setting company ID to 1 for ${userProfile.email}`
      );
      return res.json(createSuccessResponse(userWithCompany));
    }

    // Return user without company ID
    logger.debug(`Returning user profile without company ID`);
    return res.json(createSuccessResponse(userProfile));
  } catch (error) {
    logger.error("Error fetching user profile:", error);
    return res
      .status(500)
      .json(
        createErrorResponse(
          "SERVER_ERROR",
          "Failed to fetch user profile",
          error
        )
      );
  }
});

// UPDATE USER PROFILE ROUTER FUNCTIONALITY
router.put("/profile/", authenticate, async (req: Request, res: Response) => {
  try {
    // Try different ways to access the user ID
    // Use typed userId
    const targetUserId = req.user!.userId;

    if (isNaN(targetUserId) || targetUserId <= 0) {
      logger.error(`Invalid user ID: ${req.user?.userId}`);
      return res
        .status(400)
        .json(createErrorResponse("INVALID_ID", "Invalid user ID"));
    }

    // Check if user has permission to update this profile
    if (targetUserId !== req.user!.userId) {
      logger.debug(
        `User ${
          req.user!.userId
        } attempting to update profile of user ${targetUserId}`
      );

      const currentUser = await UserService.getUserById(req.user!.userId);
      if (
        !currentUser ||
        !currentUser.roles.some((role) =>
          ["Admin", "Site Admin"].includes(role)
        )
      ) {
        logger.error(
          `User ${
            req.user!.userId
          } not authorized to update profile of user ${targetUserId}`
        );
        return res
          .status(403)
          .json(
            createErrorResponse(
              "UNAUTHORIZED",
              "You do not have permission to update this user profile"
            )
          );
      }
    }

    // Check if user is trying to update roles
    if (req.body.roles) {
      const currentUser = await UserService.getUserById(req.user!.userId);
      if (!currentUser || !currentUser.roles.includes("Site Admin")) {
        logger.error(
          `User ${
            req.user!.userId
          } attempted to update roles without Site Admin privileges`
        );
        return res
          .status(403)
          .json(
            createErrorResponse(
              "UNAUTHORIZED",
              "You do not have permission to update user roles"
            )
          );
      }
    }

    // Update the user
    const updatedUser = await UserService.updateUser(targetUserId, req.body, req.user!.userId);

    if (!updatedUser) {
      logger.error(`User not found for ID: ${targetUserId}`);
      return res
        .status(404)
        .json(createErrorResponse("USER_NOT_FOUND", "User not found"));
    }

    logger.debug(`User profile updated successfully for ID: ${targetUserId}`);
    return res.json(createSuccessResponse(updatedUser));
  } catch (error) {
    logger.error("Error updating user profile:", error);
    return res
      .status(400)
      .json(
        createErrorResponse(
          "PROFILE_UPDATE_FAILED",
          error instanceof Error
            ? error.message
            : "Failed to update user profile",
          error
        )
      );
  }
});

// GET USER PROFILE BY ID ROUTER FUNCTIONALITY
router.get(
  "/profile/:id",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const targetUserId = Number(req.params.id);
      logger.debug(`Fetching profile for specific user ID: ${targetUserId}`);

      if (isNaN(targetUserId) || targetUserId <= 0) {
        logger.error(`Invalid user ID parameter: ${req.params.id}`);
        return res
          .status(400)
          .json(createErrorResponse("INVALID_ID", "Invalid user ID"));
      }

      // Get the current user's ID
      const currentUserId = req.user?.userId || (req.user as any)?.id;

      if (!currentUserId) {
        logger.error("User ID not found in authenticated request");
        return res
          .status(401)
          .json(createErrorResponse("UNAUTHORIZED", "Authentication required"));
      }

      // Check if user is requesting their own profile or is an admin
      if (Number(currentUserId) !== targetUserId) {
        // Check if user has admin privileges
        const currentUser = await UserService.getUserById(
          Number(currentUserId)
        );
        const isAdmin = currentUser?.roles.some((role) =>
          ["Admin", "Site Admin"].includes(role)
        );

        if (!isAdmin) {
          logger.error(
            `User ${currentUserId} not authorized to view profile of user ${targetUserId}`
          );
          return res
            .status(403)
            .json(
              createErrorResponse(
                "FORBIDDEN",
                "You do not have permission to view this profile"
              )
            );
        }
      }

      // Fetch user profile from database
      const [userProfile] = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          roles: users.roles,
          emailNotify: users.emailNotify,
          smsNotify: users.smsNotify,
          phoneNumber: users.phoneNumber,
          theme: users.theme,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, targetUserId));

      if (!userProfile) {
        logger.error(`User not found for ID: ${targetUserId}`);
        return res
          .status(404)
          .json(createErrorResponse("USER_NOT_FOUND", "User not found"));
      }

      // Get user's company information
      const userCompany = await db
        .select({
          companyId: companyUsers.companyId,
        })
        .from(companyUsers)
        .where(eq(companyUsers.userId, targetUserId))
        .limit(1);

      // Add company ID to response if available
      if (userCompany.length > 0) {
        const userWithCompany = {
          ...userProfile,
          companyId: userCompany[0].companyId,
        };

        return res.json(createSuccessResponse(userWithCompany));
      }

      // Return user without company ID
      return res.json(createSuccessResponse(userProfile));
    } catch (error) {
      logger.error("Error fetching user profile by ID:", error);
      return res
        .status(500)
        .json(
          createErrorResponse(
            "SERVER_ERROR",
            "Failed to fetch user profile",
            error
          )
        );
    }
  }
);

// CHANGE PASSWORD ROUTER FUNCTIONALITY
router.post(
  "/change-password",
  authenticate,
  async (req: Request<{}, {}, ChangePasswordDto>, res: Response) => {
    try {
      if (!req.user?.userId) {
        return res
          .status(401)
          .json(
            createErrorResponse("AUTH_REQUIRED", "Authentication required")
          );
      }

      await UserService.changePassword(
        Number(req.user.userId),
        req.body.currentPassword,
        req.body.newPassword
      );

      logger.debug(
        `Password changed successfully for user ID: ${req.user.userId}`
      );

      res.json(
        createSuccessResponse({
          message: "Password changed successfully",
        })
      );
    } catch (error) {
      logger.error("Error changing password:", error);

      if (
        error instanceof Error &&
        error.message === "Invalid current password"
      ) {
        return res
          .status(401)
          .json(
            createErrorResponse(
              "AUTH_INVALID_PASSWORD",
              "Invalid current password"
            )
          );
      }

      res
        .status(400)
        .json(
          createErrorResponse(
            "PASSWORD_CHANGE_FAILED",
            error instanceof Error ? error.message : "Failed to change password"
          )
        );
    }
  }
);

// GET PENDING USERS ROUTER FUNCTIONALITY
router.get("/pending", authenticate, async (req, res) => {
  try {
    logger.debug("Fetching pending users");

    // Check if user has Site Admin role
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (!currentUser || !currentUser.roles.includes("Site Admin")) {
      logger.debug(
        `User ${
          req.user!.userId
        } attempted to access pending users without Site Admin privileges`
      );
      return res
        .status(403)
        .json(
          createErrorResponse(
            "FORBIDDEN",
            "You do not have permission to access this resource"
          )
        );
    }

    const pendingUsers = await UserService.getPendingUsers();

    res.json(createSuccessResponse(pendingUsers));
  } catch (error) {
    logger.error("Error fetching pending users:", error);
    res
      .status(500)
      .json(
        createErrorResponse(
          "SERVER_ERROR",
          "Failed to fetch pending users",
          error
        )
      );
  }
});

// GET ALL USERS ROUTER FUNCTIONALITY
router.get("/", authenticate, async (req, res) => {
  try {
    logger.debug("Fetching all users");

    // Check if user has admin role
    const currentUser = await UserService.getUserById(req.user!.userId);
    if (
      !currentUser ||
      !currentUser.roles.some((role) => ["Admin", "Site Admin"].includes(role))
    ) {
      logger.debug(
        `User ${
          req.user!.userId
        } attempted to access users list without admin privileges`
      );
      return res
        .status(403)
        .json(
          createErrorResponse(
            "FORBIDDEN",
            "You do not have permission to access this resource"
          )
        );
    }

    const users = await UserService.getUsers();

    res.json(createSuccessResponse(users));
  } catch (error) {
    logger.error("Error fetching users:", error);
    res
      .status(500)
      .json(
        createErrorResponse("SERVER_ERROR", "Failed to fetch users", error)
      );
  }
});

// CREATE USER ROUTER FUNCTIONALITY
router.post(
  "/",
  async (req: Request<{}, {}, UserDto>, res: Response) => {
    try {
      logger.debug("Creating new user:", req.body.email);

      // Check if user has admin role for creating users with special roles
      if (
        req.body.roles &&
        req.body.roles.some((role) => ["Admin", "Site Admin"].includes(role)) &&
        req.user // Only check if user is authenticated
      ) {
        const currentUser = await UserService.getUserById(req.user.userId);
        if (!currentUser || !currentUser.roles.includes("Site Admin")) {
          logger.debug(
            `User ${
              req.user.userId
            } attempted to create user with admin privileges`
          );
          return res
            .status(403)
            .json(
              createErrorResponse(
                "FORBIDDEN",
                "You do not have permission to create users with admin privileges"
              )
            );
        }
      }

      const user = await UserService.createUser(req.body, req.user?.userId);

      res.status(201).json(createSuccessResponse(user));
    } catch (error) {
      logger.error("Error creating user:", error);
      res
        .status(400)
        .json(
          createErrorResponse(
            "USER_CREATE_FAILED",
            error instanceof Error ? error.message : "Failed to create user",
            error
          )
        );
    }
  }
);

// GET USER ROUTER FUNCTIONALITY
router.get(
  "/:id",
  authenticate,
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res
          .status(400)
          .json(createErrorResponse("INVALID_ID", "Invalid user ID"));
      }

      logger.debug(`Fetching user with ID: ${userId}`);

      // Check if user has permission to view other users
      if (userId !== req.user!.userId) {
        const currentUser = await UserService.getUserById(req.user!.userId);
        if (
          !currentUser ||
          !currentUser.roles.some((role) =>
            ["Admin", "Site Admin"].includes(role)
          )
        ) {
          logger.debug(
            `User ${
              req.user!.userId
            } attempted to access user ${userId} without admin privileges`
          );
          return res
            .status(403)
            .json(
              createErrorResponse(
                "FORBIDDEN",
                "You do not have permission to access this resource"
              )
            );
        }
      }

      const user = await UserService.getUserById(userId);

      if (!user) {
        return res
          .status(404)
          .json(createErrorResponse("USER_NOT_FOUND", "User not found"));
      }

      res.json(createSuccessResponse(user));
    } catch (error) {
      logger.error("Error fetching user:", error);
      res
        .status(500)
        .json(
          createErrorResponse("SERVER_ERROR", "Failed to fetch user", error)
        );
    }
  }
);

// UPDATE USER ROUTER FUNCTIONALITY
router.put(
  "/:id",
  authenticate,
  async (req: Request<{ id: string }, {}, Partial<UserDto>>, res: Response) => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res
          .status(400)
          .json(createErrorResponse("INVALID_ID", "Invalid user ID"));
      }

      logger.debug(`Updating user with ID: ${userId}`);

      // Check if user has permission to update other users
      if (userId !== req.user!.userId) {
        const currentUser = await UserService.getUserById(req.user!.userId);
        if (
          !currentUser ||
          !currentUser.roles.some((role) =>
            ["Admin", "Site Admin"].includes(role)
          )
        ) {
          logger.debug(
            `User ${
              req.user!.userId
            } attempted to update user ${userId} without admin privileges`
          );
          return res
            .status(403)
            .json(
              createErrorResponse(
                "FORBIDDEN",
                "You do not have permission to update this user"
              )
            );
        }
      }

      // Check if user is trying to update roles
      if (req.body.roles) {
        const currentUser = await UserService.getUserById(req.user!.userId);
        if (!currentUser || !currentUser.roles.includes("Site Admin")) {
          logger.debug(
            `User ${
              req.user!.userId
            } attempted to update roles for user ${userId} without Site Admin privileges`
          );
          return res
            .status(403)
            .json(
              createErrorResponse(
                "FORBIDDEN",
                "You do not have permission to update user roles"
              )
            );
        }
      }

      const user = await UserService.updateUser(userId, req.body, req.user!.userId);

      if (!user) {
        return res
          .status(404)
          .json(createErrorResponse("USER_NOT_FOUND", "User not found"));
      }

      res.json(createSuccessResponse(user));
    } catch (error) {
      logger.error("Error updating user:", error);
      res
        .status(400)
        .json(
          createErrorResponse(
            "USER_UPDATE_FAILED",
            error instanceof Error ? error.message : "Failed to update user",
            error
          )
        );
    }
  }
);

// DELETE USER ROUTER FUNCTIONALITY
router.delete(
  "/:id",
  authenticate,
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res
          .status(400)
          .json(createErrorResponse("INVALID_ID", "Invalid user ID"));
      }

      logger.debug(`Deleting user with ID: ${userId}`);

      // Check if user has permission to delete users
      const currentUser = await UserService.getUserById(req.user!.userId);
      if (!currentUser || !currentUser.roles.includes("Site Admin")) {
        logger.debug(
          `User ${
            req.user!.userId
          } attempted to delete user ${userId} without Site Admin privileges`
        );
        return res
          .status(403)
          .json(
            createErrorResponse(
              "FORBIDDEN",
              "You do not have permission to delete users"
            )
          );
      }

      // Prevent self-deletion
      if (userId === req.user!.userId) {
        return res
          .status(400)
          .json(
            createErrorResponse(
              "SELF_DELETE_FORBIDDEN",
              "You cannot delete your own account"
            )
          );
      }

      const success = await UserService.deleteUser(userId, req.user!.userId);

      if (!success) {
        return res
          .status(404)
          .json(createErrorResponse("USER_NOT_FOUND", "User not found"));
      }

      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting user:", error);
      res
        .status(500)
        .json(
          createErrorResponse("SERVER_ERROR", "Failed to delete user", error)
        );
    }
  }
);

// APPROVE USER ROUTER FUNCTIONALITY
router.post(
  "/:id/approve",
  authenticate,
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res
          .status(400)
          .json(createErrorResponse("INVALID_ID", "Invalid user ID"));
      }

      logger.debug(`Approving user with ID: ${userId}`);

      // Check if user has Site Admin role
      const currentUser = await UserService.getUserById(req.user!.userId);
      if (!currentUser || !currentUser.roles.includes("Site Admin")) {
        logger.debug(
          `User ${
            req.user!.userId
          } attempted to approve user ${userId} without Site Admin privileges`
        );
        return res
          .status(403)
          .json(
            createErrorResponse(
              "FORBIDDEN",
              "You do not have permission to approve users"
            )
          );
      }

      // Get the pending user details
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res
          .status(404)
          .json(createErrorResponse("USER_NOT_FOUND", "User not found"));
      }

      // 1. Create a company using the user's company name
      const companyName =
        (user as any).companyName || `${user.firstName}'s Company`;
      const [company] = await db
        .insert(companies)
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

      logger.debug(
        `Created company "${company.name}" (ID: ${company.id}) for approved user ${userId}`
      );

      // 2. Add the user to the company
      await db.insert(companyUsers).values({
        companyId: company.id,
        userId: userId,
      });

      logger.debug(`Added user ${userId} to company ${company.id}`);

      // 3. Update the user - set status to active and add Admin role
      const userRoles = [...(user.roles || [])];
      if (!userRoles.includes("Admin")) {
        userRoles.push("Admin");
      }

      logger.debug(`Before update: User ${userId} has status "${(user as any).status}" and roles ${JSON.stringify(user.roles)}`);

      // Explicitly set status to 'active' to ensure it's updated
      const updatedUser = await UserService.updateUser(userId, {
        status: "active",
        roles: userRoles,
      }, req.user!.userId);

      logger.debug(`After update: User ${userId} now has status "${(updatedUser as any)?.status}" and roles ${JSON.stringify(updatedUser?.roles)}`);
      
      logger.debug(`Updated user ${userId} status to 'active' and roles to ${JSON.stringify(userRoles)}`);

      // Verify the user's status directly from the database
      const [verifiedUser] = await db.select().from(users).where(eq(users.id, userId));
      logger.debug(`Verified user ${userId} from database:`, verifiedUser);

      if (!updatedUser) {
        return res
          .status(404)
          .json(
            createErrorResponse(
              "USER_UPDATE_FAILED",
              "Failed to update user status"
            )
          );
      }

      logger.debug(
        `User ${userId} was approved by admin ${
          req.user!.userId
        } and given Admin role`
      );

      res.json(
        createSuccessResponse({
          message: "User approved successfully",
          user: updatedUser,
          company: company,
        })
      );
    } catch (error) {
      logger.error("Error approving user:", error);
      res
        .status(500)
        .json(
          createErrorResponse("SERVER_ERROR", "Failed to approve user", error)
        );
    }
  }
);

// REJECT USER ROUTER FUNCTIONALITY
router.post(
  "/:id/reject",
  authenticate,
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res
          .status(400)
          .json(createErrorResponse("INVALID_ID", "Invalid user ID"));
      }

      logger.debug(`Rejecting user with ID: ${userId}`);

      // Check if user has Site Admin role
      const currentUser = await UserService.getUserById(req.user!.userId);
      if (!currentUser || !currentUser.roles.includes("Site Admin")) {
        logger.debug(
          `User ${
            req.user!.userId
          } attempted to reject user ${userId} without Site Admin privileges`
        );
        return res
          .status(403)
          .json(
            createErrorResponse(
              "FORBIDDEN",
              "You do not have permission to reject users"
            )
          );
      }

      // First check if the user exists
      const user = await UserService.getUserById(userId);
      if (!user) {
        return res
          .status(404)
          .json(createErrorResponse("USER_NOT_FOUND", "User not found"));
      }

      // Delete the user
      const success = await UserService.deleteUser(userId, req.user!.userId);
      if (!success) {
        return res
          .status(404)
          .json(
            createErrorResponse(
              "USER_DELETE_FAILED",
              "Failed to delete rejected user"
            )
          );
      }

      logger.debug(
        `User ${userId} was rejected and deleted by admin ${req.user!.userId}`
      );

      res.json(
        createSuccessResponse({
          message: "User rejected and deleted successfully",
        })
      );
    } catch (error) {
      logger.error("Error rejecting user:", error);
      res
        .status(500)
        .json(
          createErrorResponse("SERVER_ERROR", "Failed to reject user", error)
        );
    }
  }
);

// UPDATE USER PREFERENCES ROUTER FUNCTIONALITY
router.put(
  "/:id/preferences",
  authenticate,
  async (
    req: Request<{ id: string }, {}, UserPreferencesDto>,
    res: Response
  ) => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        return res
          .status(400)
          .json(createErrorResponse("INVALID_ID", "Invalid user ID"));
      }

      logger.debug(`Updating preferences for user ID: ${userId}`);

      // Check if user has permission to update preferences
      if (userId !== req.user!.userId) {
        const currentUser = await UserService.getUserById(req.user!.userId);
        if (
          !currentUser ||
          !currentUser.roles.some((role) =>
            ["Admin", "Site Admin"].includes(role)
          )
        ) {
          logger.debug(
            `User ${
              req.user!.userId
            } attempted to update preferences for user ${userId} without admin privileges`
          );
          return res
            .status(403)
            .json(
              createErrorResponse(
                "FORBIDDEN",
                "You do not have permission to update preferences for this user"
              )
            );
        }
      }

      // Create a clean preferences object
      const preferences: UserPreferencesDto = {
        emailNotify: req.body.emailNotify,
        theme: req.body.theme,
      };

      // Handle phone number
      if ("phoneNumber" in req.body) {
        if (req.body.phoneNumber === null || req.body.phoneNumber === "") {
          preferences.phoneNumber = null;
        } else {
          const phoneStr = String(req.body.phoneNumber).trim();
          if (!/^\d+$/.test(phoneStr)) {
            return res
              .status(400)
              .json(
                createErrorResponse(
                  "INVALID_PHONE",
                  "Phone number must contain only digits"
                )
              );
          }
          preferences.phoneNumber = phoneStr;
        }
      }

      const user = await UserService.updateUser(userId, preferences, req.user!.userId);

      if (!user) {
        return res
          .status(404)
          .json(createErrorResponse("USER_NOT_FOUND", "User not found"));
      }

      res.json(createSuccessResponse(user));
    } catch (error) {
      logger.error("Error updating preferences:", error);
      res
        .status(400)
        .json(
          createErrorResponse(
            "PREFERENCES_UPDATE_FAILED",
            error instanceof Error
              ? error.message
              : "Failed to update preferences",
            error
          )
        );
    }
  }
);

logger.info("All user routes mounted successfully");

export default router;
