import { post } from './api';

export type ActivityType = 'proposal' | 'template' | 'company' | 'user' | 'gallery' | 'review';
export type ActivityAction = 'created' | 'updated' | 'deleted';

interface LogActivityOptions {
  type: ActivityType;
  action: ActivityAction;
  title: string;
  entityId: number;
}

export async function logActivity({ type, action, title, entityId }: LogActivityOptions): Promise<void> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ No authentication token found for logging activity');
      return;
    }

    const response = await post('/api/v1/activity/log', {
      type,
      action,
      title,
      entityId
    }, token);

    if (!response.ok) {
      const responseData = await response.json().catch(() => ({}));
      console.warn('❌ Failed to log activity:', responseData);
    }
  } catch (error) {
    console.warn('❌ Error logging activity:', error);
  }
}