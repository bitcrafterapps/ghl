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
exports.ImpersonationService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const logger_1 = require("../logger");
const logger = logger_1.LoggerFactory.getLogger('ImpersonationService');
class ImpersonationService {
    /**
     * Generate an impersonation token for an admin to act as a target user
     * @param adminUserId The ID of the admin performing the impersonation
     * @param targetUserId The ID of the user to impersonate
     */
    static impersonateUser(adminUserId, targetUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                logger.info(`Admin ${adminUserId} attempting to impersonate user ${targetUserId}`);
                // 1. Verify Admin (Caller) - though middleware should handle role check, we double check existence
                const [admin] = yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, adminUserId));
                if (!admin) {
                    throw new Error('Admin user not found');
                }
                // 2. Verify Target User
                const [targetUser] = yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, targetUserId));
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
                const token = jsonwebtoken_1.default.sign({
                    userId: targetUser.id,
                    email: targetUser.email,
                    roles: targetUser.roles || ['User'],
                    impersonatorId: admin.id // The Magic Claim
                }, secret, { expiresIn: '1h' } // Shorter expiry for impersonation sessions
                );
                logger.info(`Impersonation token generated for Admin ${adminUserId} -> User ${targetUserId}`);
                const { password } = targetUser, userWithoutPassword = __rest(targetUser, ["password"]);
                return {
                    token,
                    user: Object.assign(Object.assign({}, userWithoutPassword), { roles: (userWithoutPassword.roles || ['User']), emailNotify: (_a = userWithoutPassword.emailNotify) !== null && _a !== void 0 ? _a : true, phoneNumber: (_b = userWithoutPassword.phoneNumber) !== null && _b !== void 0 ? _b : null, smsNotify: (_c = userWithoutPassword.smsNotify) !== null && _c !== void 0 ? _c : false, theme: (userWithoutPassword.theme || 'system'), status: userWithoutPassword.status || 'active' })
                };
            }
            catch (error) {
                logger.error('Error during impersonation:', error);
                throw error;
            }
        });
    }
}
exports.ImpersonationService = ImpersonationService;
