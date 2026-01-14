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
exports.CompanyService = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const logger_1 = require("../logger");
const activity_service_1 = require("./activity.service");
const logger = logger_1.LoggerFactory.getLogger('CompanyService');
class CompanyService {
    /**
     * Get all companies
     */
    static getAllCompanies() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug('Getting all companies');
            return yield db_1.db.select().from(schema_1.companies);
        });
    }
    /**
     * Get company by ID
     */
    static getCompanyById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`Getting company with ID: ${id}`);
            const result = yield db_1.db.select().from(schema_1.companies).where((0, drizzle_orm_1.eq)(schema_1.companies.id, id));
            return result.length > 0 ? result[0] : null;
        });
    }
    /**
     * Get company with its users
     */
    static getCompanyWithUsers(id) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`Getting company with ID: ${id} and its users`);
            // Get the company
            const company = yield this.getCompanyById(id);
            if (!company)
                return null;
            // Get the company's users
            const companyUsersList = yield db_1.db
                .select({
                userId: schema_1.companyUsers.userId
            })
                .from(schema_1.companyUsers)
                .where((0, drizzle_orm_1.eq)(schema_1.companyUsers.companyId, id));
            const userIds = companyUsersList.map(cu => cu.userId);
            // If there are no users, return just the company
            if (userIds.length === 0) {
                return { company, users: [] };
            }
            // Get the user details
            const usersList = yield db_1.db
                .select({
                id: schema_1.users.id,
                email: schema_1.users.email,
                firstName: schema_1.users.firstName,
                lastName: schema_1.users.lastName,
                roles: schema_1.users.roles,
                status: schema_1.users.status,
                jobTitle: schema_1.users.jobTitle,
                createdAt: schema_1.users.createdAt,
                updatedAt: schema_1.users.updatedAt
            })
                .from(schema_1.users)
                .where(userIds.length === 1
                ? (0, drizzle_orm_1.eq)(schema_1.users.id, userIds[0])
                : (0, drizzle_orm_1.inArray)(schema_1.users.id, userIds));
            // Add joinedAt date from companyUsers table
            const usersWithJoinedAt = yield Promise.all(usersList.map((user) => __awaiter(this, void 0, void 0, function* () {
                const [companyUser] = yield db_1.db
                    .select({
                    createdAt: schema_1.companyUsers.createdAt
                })
                    .from(schema_1.companyUsers)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.companyUsers.companyId, id), (0, drizzle_orm_1.eq)(schema_1.companyUsers.userId, user.id)));
                return Object.assign(Object.assign({}, user), { joinedAt: (companyUser === null || companyUser === void 0 ? void 0 : companyUser.createdAt) || user.createdAt });
            })));
            return { company, users: usersWithJoinedAt };
        });
    }
    /**
     * Create a new company
     */
    static createCompany(data, actorUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`Creating new company: ${data.name}`);
            const [company] = yield db_1.db.insert(schema_1.companies).values(data).returning();
            // Log activity if actor provided (or just system log if needed, but ActivityService requires userId)
            if (actorUserId) {
                try {
                    yield activity_service_1.ActivityService.logActivity({
                        type: 'company',
                        action: 'created',
                        title: `Company: ${company.name}`,
                        entityId: company.id,
                        userId: actorUserId
                    });
                }
                catch (err) {
                    logger.error('Failed to log company creation activity', err);
                }
            }
            return company;
        });
    }
    /**
     * Update a company
     */
    static updateCompany(id, data, actorUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`Updating company with ID: ${id}`);
            const [company] = yield db_1.db
                .update(schema_1.companies)
                .set(Object.assign(Object.assign({}, data), { updatedAt: new Date() }))
                .where((0, drizzle_orm_1.eq)(schema_1.companies.id, id))
                .returning();
            if (company && actorUserId) {
                try {
                    yield activity_service_1.ActivityService.logActivity({
                        type: 'company',
                        action: 'updated',
                        title: `Company: ${company.name}`,
                        entityId: company.id,
                        userId: actorUserId
                    });
                }
                catch (err) {
                    logger.error('Failed to log company update activity', err);
                }
            }
            return company;
        });
    }
    /**
     * Delete a company
     */
    static deleteCompany(id, actorUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`Deleting company with ID: ${id}`);
            // Get company name first for logging
            const companyToDelete = yield this.getCompanyById(id);
            // This will cascade delete company_users entries due to foreign key constraint
            const [company] = yield db_1.db
                .delete(schema_1.companies)
                .where((0, drizzle_orm_1.eq)(schema_1.companies.id, id))
                .returning();
            if (companyToDelete && actorUserId) {
                try {
                    yield activity_service_1.ActivityService.logActivity({
                        type: 'company',
                        action: 'deleted',
                        title: `Company: ${companyToDelete.name}`,
                        entityId: id,
                        userId: actorUserId
                    });
                }
                catch (err) {
                    logger.error('Failed to log company deletion activity', err);
                }
            }
            return company;
        });
    }
    /**
     * Add a user to a company
     */
    static addUserToCompany(companyId, userId, actorUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`Adding user ${userId} to company ${companyId}`);
            // Check if the relationship already exists
            const existing = yield db_1.db
                .select()
                .from(schema_1.companyUsers)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.companyUsers.companyId, companyId), (0, drizzle_orm_1.eq)(schema_1.companyUsers.userId, userId)));
            if (existing.length > 0) {
                logger.debug(`User ${userId} is already in company ${companyId}`);
                return existing[0];
            }
            // Create the relationship
            const [relationship] = yield db_1.db
                .insert(schema_1.companyUsers)
                .values({ companyId, userId })
                .returning();
            if (actorUserId) {
                try {
                    // Get company and user details for a nice message
                    const company = yield this.getCompanyById(companyId);
                    // We can't easily get the user service here to avoid circular deps if user service imports company service
                    // So we'll just log IDs or basic info
                    if (company) {
                        yield activity_service_1.ActivityService.logActivity({
                            type: 'company',
                            action: 'user_added', // This might need to be added to allowed actions or use 'updated'
                            title: `User ${userId} added to Company ${company.name}`,
                            entityId: companyId,
                            userId: actorUserId
                        });
                    }
                }
                catch (err) {
                    logger.error('Failed to log user addition to company', err);
                }
            }
            return relationship;
        });
    }
    /**
     * Remove a user from a company
     */
    static removeUserFromCompany(companyId, userId, actorUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`Removing user ${userId} from company ${companyId}`);
            const [relationship] = yield db_1.db
                .delete(schema_1.companyUsers)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.companyUsers.companyId, companyId), (0, drizzle_orm_1.eq)(schema_1.companyUsers.userId, userId)))
                .returning();
            if (relationship && actorUserId) {
                try {
                    const company = yield this.getCompanyById(companyId);
                    if (company) {
                        yield activity_service_1.ActivityService.logActivity({
                            type: 'company',
                            action: 'user_removed', // This might need to be added to allowed actions or use 'updated'
                            title: `User ${userId} removed from Company ${company.name}`,
                            entityId: companyId,
                            userId: actorUserId
                        });
                    }
                }
                catch (err) {
                    logger.error('Failed to log user removal from company', err);
                }
            }
            return relationship;
        });
    }
    /**
     * Get all users in a company
     */
    static getCompanyUsers(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`Getting all users in company ${companyId}`);
            const companyUsersList = yield db_1.db
                .select({
                userId: schema_1.companyUsers.userId,
                createdAt: schema_1.companyUsers.createdAt
            })
                .from(schema_1.companyUsers)
                .where((0, drizzle_orm_1.eq)(schema_1.companyUsers.companyId, companyId));
            const userIds = companyUsersList.map(cu => cu.userId);
            if (userIds.length === 0) {
                return [];
            }
            const usersList = yield db_1.db
                .select({
                id: schema_1.users.id,
                email: schema_1.users.email,
                firstName: schema_1.users.firstName,
                lastName: schema_1.users.lastName,
                roles: schema_1.users.roles,
                status: schema_1.users.status,
                jobTitle: schema_1.users.jobTitle,
                createdAt: schema_1.users.createdAt,
                updatedAt: schema_1.users.updatedAt
            })
                .from(schema_1.users)
                .where(userIds.length === 1
                ? (0, drizzle_orm_1.eq)(schema_1.users.id, userIds[0])
                : (0, drizzle_orm_1.inArray)(schema_1.users.id, userIds));
            // Add joinedAt date from companyUsers table
            return usersList.map(user => {
                const companyUser = companyUsersList.find(cu => cu.userId === user.id);
                return Object.assign(Object.assign({}, user), { joinedAt: (companyUser === null || companyUser === void 0 ? void 0 : companyUser.createdAt) || user.createdAt });
            });
        });
    }
    /**
     * Get the company ID for a user (returns first company if user belongs to multiple)
     */
    static getUserCompanyId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.debug(`Getting company ID for user ${userId}`);
            const [companyUser] = yield db_1.db
                .select({
                companyId: schema_1.companyUsers.companyId
            })
                .from(schema_1.companyUsers)
                .where((0, drizzle_orm_1.eq)(schema_1.companyUsers.userId, userId))
                .limit(1);
            return (companyUser === null || companyUser === void 0 ? void 0 : companyUser.companyId) || null;
        });
    }
}
exports.CompanyService = CompanyService;
