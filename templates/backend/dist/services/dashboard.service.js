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
const logger = logger_1.LoggerFactory.getLogger('DashboardService');
class DashboardService {
    static getDashboardStats(userId, isSiteAdmin) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = {
                    companies: 0,
                    users: 0,
                    pendingUsers: 0,
                    notifications: 0
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
                    // Get unread notifications count (recent activity logs)
                    const [notificationsCount] = yield db_1.db
                        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                        .from(schema_1.activityLog)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.activityLog.userId, userId), (0, drizzle_orm_1.sql) `${schema_1.activityLog.createdAt} > NOW() - INTERVAL '7 days'`));
                    stats.users = Number((userCount === null || userCount === void 0 ? void 0 : userCount.count) || 0);
                    stats.pendingUsers = Number((pendingUserCount === null || pendingUserCount === void 0 ? void 0 : pendingUserCount.count) || 0);
                    stats.companies = Number((companyCount === null || companyCount === void 0 ? void 0 : companyCount.count) || 0);
                    stats.notifications = Number((notificationsCount === null || notificationsCount === void 0 ? void 0 : notificationsCount.count) || 0);
                }
                else {
                    // For non-admin users, just get their notifications count
                    const [notificationsCount] = yield db_1.db
                        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                        .from(schema_1.activityLog)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.activityLog.userId, userId), (0, drizzle_orm_1.sql) `${schema_1.activityLog.createdAt} > NOW() - INTERVAL '7 days'`));
                    stats.notifications = Number((notificationsCount === null || notificationsCount === void 0 ? void 0 : notificationsCount.count) || 0);
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
