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
exports.ActivityService = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const logger_1 = require("../logger");
const websocket_1 = require("../websocket");
const logger = logger_1.LoggerFactory.getLogger('ActivityService');
class ActivityService {
    static logActivity(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Convert UUID string entityId to a hash number if needed
                let numericEntityId;
                if (typeof data.entityId === 'string') {
                    // Create a simple hash from UUID for the entityId column
                    numericEntityId = Math.abs(data.entityId.split('').reduce((a, b) => {
                        a = ((a << 5) - a) + b.charCodeAt(0);
                        return a & a;
                    }, 0));
                }
                else {
                    numericEntityId = data.entityId;
                }
                const [activity] = yield db_1.db.insert(schema_1.activityLog)
                    .values({
                    type: data.type,
                    action: data.action,
                    title: data.title,
                    entityId: numericEntityId,
                    userId: data.userId
                    // Let database use defaultNow() for createdAt
                })
                    .returning();
                logger.debug('Activity logged:', activity);
                // Emit real-time notification if associated with a user
                if (data.userId) {
                    // Map createdAt to timestamp to match API response structure
                    const notification = Object.assign(Object.assign({}, activity), { timestamp: activity.createdAt });
                    (0, websocket_1.emitToUser)(data.userId.toString(), 'notification:new', notification);
                }
                return activity;
            }
            catch (error) {
                logger.error('Failed to log activity:', error);
                throw error;
            }
        });
    }
}
exports.ActivityService = ActivityService;
