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
exports.DashboardService = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const logger_1 = require("../logger");
const company_1 = require("../utils/company");
const logger = logger_1.LoggerFactory.getLogger('DashboardService');
class DashboardService {
    static getDashboardStats(userId, isSiteAdmin) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = {
                    companies: 0,
                    users: 0,
                    pendingUsers: 0,
                    notifications: 0,
                    activeJobs: 0,
                    pendingJobs: 0,
                    completedJobs: 0,
                    totalRevenue: 0,
                    activeContracts: 0,
                    totalContracts: 0,
                    contractRevenue: 0,
                    jobStatusDistribution: [],
                    totalContacts: 0,
                    newContacts: 0,
                    totalReviews: 0,
                    averageRating: 0,
                    galleryItems: 0
                };
                // Get user and company counts if site admin
                if (isSiteAdmin) {
                    const [userCount] = yield db_1.db
                        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                        .from(schema_1.users)
                        .where((0, drizzle_orm_1.eq)(schema_1.users.status, 'active'));
                    const [pendingUserCount] = yield db_1.db
                        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                        .from(schema_1.users)
                        .where((0, drizzle_orm_1.eq)(schema_1.users.status, 'pending'));
                    const [companyCount] = yield db_1.db
                        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                        .from(schema_1.companies);
                    stats.users = Number((userCount === null || userCount === void 0 ? void 0 : userCount.count) || 0);
                    stats.pendingUsers = Number((pendingUserCount === null || pendingUserCount === void 0 ? void 0 : pendingUserCount.count) || 0);
                    stats.companies = Number((companyCount === null || companyCount === void 0 ? void 0 : companyCount.count) || 0);
                }
                // Notification stats (common)
                const [notificationsCount] = yield db_1.db
                    .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                    .from(schema_1.activityLog)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.activityLog.userId, userId), (0, drizzle_orm_1.sql) `${schema_1.activityLog.createdAt} > NOW() - INTERVAL '7 days'`));
                stats.notifications = Number((notificationsCount === null || notificationsCount === void 0 ? void 0 : notificationsCount.count) || 0);
                // Company specific stats
                const companyId = yield (0, company_1.getUserCompanyId)(userId);
                logger.debug(`DashboardStats: User ${userId} -> Company ${companyId}`);
                if (companyId) {
                    // --- JOBS ---
                    // Active: scheduled, in_progress, approved
                    const [activeJobsCount] = yield db_1.db
                        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                        .from(schema_1.jobs)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobs.companyId, companyId), (0, drizzle_orm_1.inArray)(schema_1.jobs.status, ['scheduled', 'in_progress', 'approved'])));
                    logger.debug(`DashboardStats: Active Jobs Count Raw:`, activeJobsCount);
                    // Pending: lead, quoted
                    const [pendingJobsCount] = yield db_1.db
                        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                        .from(schema_1.jobs)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobs.companyId, companyId), (0, drizzle_orm_1.inArray)(schema_1.jobs.status, ['lead', 'quoted'])));
                    // Completed: completed, invoiced, paid
                    const [completedJobsCount] = yield db_1.db
                        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                        .from(schema_1.jobs)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobs.companyId, companyId), (0, drizzle_orm_1.inArray)(schema_1.jobs.status, ['completed', 'invoiced', 'paid'])));
                    stats.activeJobs = Number((activeJobsCount === null || activeJobsCount === void 0 ? void 0 : activeJobsCount.count) || 0);
                    stats.pendingJobs = Number((pendingJobsCount === null || pendingJobsCount === void 0 ? void 0 : pendingJobsCount.count) || 0);
                    stats.completedJobs = Number((completedJobsCount === null || completedJobsCount === void 0 ? void 0 : completedJobsCount.count) || 0);
                    // Revenue (Paid jobs)
                    const [revenueResult] = yield db_1.db
                        .select({ total: (0, drizzle_orm_1.sql) `sum(${schema_1.jobs.finalAmount})` })
                        .from(schema_1.jobs)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobs.companyId, companyId), (0, drizzle_orm_1.eq)(schema_1.jobs.status, 'paid')));
                    stats.totalRevenue = Number((revenueResult === null || revenueResult === void 0 ? void 0 : revenueResult.total) || 0);
                    // --- CONTRACTS ---
                    const [activeContractsCount] = yield db_1.db
                        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                        .from(schema_1.serviceContracts)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.serviceContracts.companyId, companyId), (0, drizzle_orm_1.eq)(schema_1.serviceContracts.status, 'active')));
                    const [totalContractsCount] = yield db_1.db
                        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                        .from(schema_1.serviceContracts)
                        .where((0, drizzle_orm_1.eq)(schema_1.serviceContracts.companyId, companyId));
                    const [contractRevResult] = yield db_1.db
                        .select({ total: (0, drizzle_orm_1.sql) `sum(${schema_1.serviceContracts.amount})` })
                        .from(schema_1.serviceContracts)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.serviceContracts.companyId, companyId), (0, drizzle_orm_1.eq)(schema_1.serviceContracts.status, 'active')));
                    stats.activeContracts = Number((activeContractsCount === null || activeContractsCount === void 0 ? void 0 : activeContractsCount.count) || 0);
                    stats.totalContracts = Number((totalContractsCount === null || totalContractsCount === void 0 ? void 0 : totalContractsCount.count) || 0);
                    stats.contractRevenue = Number((contractRevResult === null || contractRevResult === void 0 ? void 0 : contractRevResult.total) || 0);
                    // --- CONTACTS ---
                    const [contactsCount] = yield db_1.db
                        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                        .from(schema_1.contacts)
                        .where((0, drizzle_orm_1.eq)(schema_1.contacts.companyId, companyId));
                    const [newContactsCount] = yield db_1.db
                        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                        .from(schema_1.contacts)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.contacts.companyId, companyId), (0, drizzle_orm_1.sql) `${schema_1.contacts.createdAt} > NOW() - INTERVAL '30 days'`));
                    stats.totalContacts = Number((contactsCount === null || contactsCount === void 0 ? void 0 : contactsCount.count) || 0);
                    stats.newContacts = Number((newContactsCount === null || newContactsCount === void 0 ? void 0 : newContactsCount.count) || 0);
                    // --- REVIEWS ---
                    const [reviewsCount] = yield db_1.db
                        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                        .from(schema_1.reviews)
                        .where((0, drizzle_orm_1.eq)(schema_1.reviews.companyId, companyId));
                    const [avgRatingResult] = yield db_1.db
                        .select({ avg: (0, drizzle_orm_1.sql) `avg(${schema_1.reviews.rating})` })
                        .from(schema_1.reviews)
                        .where((0, drizzle_orm_1.eq)(schema_1.reviews.companyId, companyId));
                    stats.totalReviews = Number((reviewsCount === null || reviewsCount === void 0 ? void 0 : reviewsCount.count) || 0);
                    stats.averageRating = Number((avgRatingResult === null || avgRatingResult === void 0 ? void 0 : avgRatingResult.avg) || 0);
                    // --- GALLERY ---
                    const [galleryCount] = yield db_1.db
                        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                        .from(schema_1.jobPhotos)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.jobPhotos.companyId, companyId), (0, drizzle_orm_1.eq)(schema_1.jobPhotos.publishStatus, 'published')));
                    stats.galleryItems = Number((galleryCount === null || galleryCount === void 0 ? void 0 : galleryCount.count) || 0);
                    // Job Distribution
                    const distribution = yield db_1.db
                        .select({
                        status: schema_1.jobs.status,
                        count: (0, drizzle_orm_1.sql) `count(*)::int`
                    })
                        .from(schema_1.jobs)
                        .where((0, drizzle_orm_1.eq)(schema_1.jobs.companyId, companyId))
                        .groupBy(schema_1.jobs.status);
                    stats.jobStatusDistribution = distribution.map(d => ({
                        status: d.status || 'unknown',
                        count: d.count
                    }));
                }
                return stats;
            }
            catch (error) {
                logger.error('Error fetching dashboard stats:', error);
                throw error;
            }
        });
    }
}
exports.DashboardService = DashboardService;
