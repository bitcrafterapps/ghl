import { db } from '../db';
import { activityLog } from '../db/schema';
import { LoggerFactory } from '../logger';
import { emitToUser } from '../websocket';

const logger = LoggerFactory.getLogger('ActivityService');

export class ActivityService {
  static async logActivity(data: {
    type: 'proposal' | 'template' | 'company' | 'user' | 'project' | 'prd' | 'generation' | 'gallery' | 'review';
    action: 'created' | 'updated' | 'deleted' | 'generated' | 'user_added' | 'user_removed';
    title: string;
    entityId: number | string;
    userId?: number;
  }) {
    try {
      // Convert UUID string entityId to a hash number if needed
      let numericEntityId: number;
      if (typeof data.entityId === 'string') {
        // Create a simple hash from UUID for the entityId column
        numericEntityId = Math.abs(data.entityId.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0));
      } else {
        numericEntityId = data.entityId;
      }

      const [activity] = await db.insert(activityLog)
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
        const notification = {
          ...activity,
          timestamp: activity.createdAt
        };
        emitToUser(data.userId.toString(), 'notification:new', notification);
      }

      return activity;
    } catch (error) {
      logger.error('Failed to log activity:', error);
      throw error;
    }
  }
} 